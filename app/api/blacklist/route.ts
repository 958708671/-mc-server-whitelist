import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    let blacklist;
    if (search) {
      blacklist = await sql`
        SELECT * FROM blacklist 
        WHERE minecraft_id ILIKE ${'%' + search + '%'}
        ORDER BY created_at DESC
      `;
    } else {
      blacklist = await sql`
        SELECT * FROM blacklist 
        ORDER BY created_at DESC
      `;
    }
    
    return NextResponse.json({
      success: true,
      data: blacklist
    });
  } catch (error) {
    console.error('获取黑名单列表失败:', error);
    return NextResponse.json(
      { success: false, message: '获取黑名单列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { minecraft_id, reason, banned_by, banned_by_id, expires_at } = data;
    
    if (!minecraft_id) {
      return NextResponse.json(
        { success: false, message: '游戏ID为必填项' },
        { status: 400 }
      );
    }
    
    const existing = await sql`
      SELECT id FROM blacklist WHERE minecraft_id = ${minecraft_id}
    `;
    
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: '该玩家已在黑名单中' },
        { status: 400 }
      );
    }
    
    await sql`
      INSERT INTO blacklist (minecraft_id, reason, banned_by, banned_by_id, expires_at)
      VALUES (${minecraft_id}, ${reason || ''}, ${banned_by || null}, ${banned_by_id || null}, ${expires_at || null})
    `;
    
    await sql`
      UPDATE whitelist_applications 
      SET status = 'banned'
      WHERE minecraft_id = ${minecraft_id} AND status = 'approved'
    `;
    
    return NextResponse.json({
      success: true,
      message: '已添加到黑名单'
    });
  } catch (error) {
    console.error('添加黑名单失败:', error);
    return NextResponse.json(
      { success: false, message: '添加黑名单失败' },
      { status: 500 }
    );
  }
}
