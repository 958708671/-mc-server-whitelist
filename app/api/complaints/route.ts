import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const adminId = searchParams.get('adminId');
    const isOwner = searchParams.get('isOwner') === 'true';
    
    let complaints;
    
    if (isOwner) {
      if (status && status !== 'all') {
        complaints = await sql`SELECT * FROM complaints WHERE status = ${status} ORDER BY created_at DESC`;
      } else {
        complaints = await sql`SELECT * FROM complaints ORDER BY created_at DESC`;
      }
    } else {
      if (status && status !== 'all') {
        if (status === 'processing') {
          complaints = await sql`
            SELECT * FROM complaints 
            WHERE status = ${status} AND handler_id = ${parseInt(adminId || '0')}
            ORDER BY created_at DESC
          `;
        } else {
          complaints = await sql`
            SELECT * FROM complaints 
            WHERE status = ${status} AND (handler_id IS NULL OR handler_id = ${parseInt(adminId || '0')})
            ORDER BY created_at DESC
          `;
        }
      } else {
        complaints = await sql`
          SELECT * FROM complaints 
          WHERE status = 'pending' OR (status = 'processing' AND handler_id = ${parseInt(adminId || '0')})
          ORDER BY created_at DESC
        `;
      }
    }
    
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
