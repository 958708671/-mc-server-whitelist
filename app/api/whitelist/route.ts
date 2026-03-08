import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    let whitelist;
    if (search) {
      whitelist = await sql`
        SELECT id, minecraft_id, age, contact, reviewed_by, reviewed_at, created_at
        FROM whitelist_applications 
        WHERE status = 'approved' AND minecraft_id ILIKE ${'%' + search + '%'}
        ORDER BY reviewed_at DESC
      `;
    } else {
      whitelist = await sql`
        SELECT id, minecraft_id, age, contact, reviewed_by, reviewed_at, created_at
        FROM whitelist_applications 
        WHERE status = 'approved'
        ORDER BY reviewed_at DESC
      `;
    }
    
    return NextResponse.json({
      success: true,
      data: whitelist
    });
  } catch (error) {
    console.error('获取白名单列表失败:', error);
    return NextResponse.json(
      { success: false, message: '获取白名单列表失败' },
      { status: 500 }
    );
  }
}
