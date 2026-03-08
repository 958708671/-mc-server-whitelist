import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const adminId = searchParams.get('adminId');
    
    let applications;
    if (status === 'pending') {
      applications = await sql`
        SELECT * FROM whitelist_applications 
        WHERE status = 'pending'
        ORDER BY created_at DESC
      `;
    } else if (adminId) {
      applications = await sql`
        SELECT * FROM whitelist_applications 
        WHERE reviewed_by_id = ${parseInt(adminId)}
        ORDER BY reviewed_at DESC
        LIMIT 50
      `;
    } else {
      applications = await sql`
        SELECT * FROM whitelist_applications 
        ORDER BY created_at DESC
        LIMIT 100
      `;
    }
    
    return NextResponse.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('获取申请列表失败:', error);
    return NextResponse.json(
      { success: false, message: '获取申请列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { minecraft_id, age, contact, reason } = data;
    
    if (!minecraft_id || !contact) {
      return NextResponse.json(
        { success: false, message: '游戏ID和联系方式为必填项' },
        { status: 400 }
      );
    }
    
    const existing = await sql`
      SELECT id FROM whitelist_applications 
      WHERE minecraft_id = ${minecraft_id} AND status = 'pending'
    `;
    
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: '您已有待审核的申请，请等待管理员处理' },
        { status: 400 }
      );
    }
    
    await sql`
      INSERT INTO whitelist_applications (minecraft_id, age, contact, reason, status)
      VALUES (${minecraft_id}, ${age || null}, ${contact}, ${reason || ''}, 'pending')
    `;
    
    return NextResponse.json({
      success: true,
      message: '申请提交成功'
    });
  } catch (error) {
    console.error('提交申请失败:', error);
    return NextResponse.json(
      { success: false, message: '提交申请失败' },
      { status: 500 }
    );
  }
}
