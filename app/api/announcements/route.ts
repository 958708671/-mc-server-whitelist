import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active');
    
    let announcements;
    if (activeOnly === 'true') {
      announcements = await sql`
        SELECT * FROM announcements 
        WHERE (expires_at IS NULL OR expires_at > NOW())
        ORDER BY is_pinned DESC, sort_order ASC, created_at DESC
      `;
    } else {
      announcements = await sql`
        SELECT * FROM announcements 
        ORDER BY is_pinned DESC, sort_order ASC, created_at DESC
      `;
    }
    
    return NextResponse.json({
      success: true,
      data: announcements
    });
  } catch (error) {
    console.error('获取公告列表失败:', error);
    return NextResponse.json(
      { success: false, message: '获取公告列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { title, content, type, is_pinned, created_by, created_by_id, expires_at } = data;
    
    if (!title || !content) {
      return NextResponse.json(
        { success: false, message: '标题和内容为必填项' },
        { status: 400 }
      );
    }
    
    // 获取当前最大的sort_order值
    const maxSortOrder = await sql`
      SELECT COALESCE(MAX(sort_order), 0) as max_order FROM announcements
    `;
    const newSortOrder = (maxSortOrder[0].max_order || 0) + 1;
    
    await sql`
      INSERT INTO announcements (title, content, type, is_pinned, created_by, created_by_id, expires_at, sort_order)
      VALUES (${title}, ${content}, ${type || 'normal'}, ${is_pinned || false}, ${created_by || null}, ${created_by_id || null}, ${expires_at || null}, ${newSortOrder})
    `;
    
    return NextResponse.json({
      success: true,
      message: '公告发布成功'
    });
  } catch (error) {
    console.error('发布公告失败:', error);
    return NextResponse.json(
      { success: false, message: '发布公告失败' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, sort_order } = data;
    
    if (!id || sort_order === undefined) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      );
    }
    
    await sql`
      UPDATE announcements SET sort_order = ${sort_order} WHERE id = ${id}
    `;
    
    return NextResponse.json({
      success: true,
      message: '排序更新成功'
    });
  } catch (error) {
    console.error('更新排序失败:', error);
    return NextResponse.json(
      { success: false, message: '更新排序失败' },
      { status: 500 }
    );
  }
}
