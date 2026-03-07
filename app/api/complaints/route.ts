import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '');

// 获取所有投诉列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    let query = 'SELECT * FROM complaints ORDER BY created_at DESC';
    let params: any[] = [];
    
    if (status && status !== 'all') {
      query = 'SELECT * FROM complaints WHERE status = $1 ORDER BY created_at DESC';
      params = [status];
    }
    
    const complaints = await sql(query, params);
    
    return NextResponse.json({ 
      success: true, 
      data: complaints 
    });

  } catch (error) {
    console.error('获取投诉列表失败:', error);
    return NextResponse.json(
      { success: false, message: '获取投诉列表失败' },
      { status: 500 }
    );
  }
}
