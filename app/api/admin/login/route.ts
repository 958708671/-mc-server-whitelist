import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '');

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: '请输入用户名和密码' },
        { status: 400 }
      );
    }
    
    // 查询管理员
    const admins = await sql`
      SELECT id, username, display_name, qq, is_owner FROM admins 
      WHERE username = ${username} AND password = ${password}
    `;
    
    if (admins.length === 0) {
      return NextResponse.json(
        { success: false, message: '用户名或密码错误' },
        { status: 401 }
      );
    }
    
    const admin = admins[0];
    
    // 记录登录日志
    try {
      await sql`
        INSERT INTO admin_logs (admin_id, action, details, created_at)
        VALUES (${admin.id}, 'login', '管理员登录', NOW())
      `;
    } catch (logError) {
      console.error('记录登录日志失败:', logError);
    }
    
    return NextResponse.json({
      success: true,
      user: admin.display_name || admin.username,
      adminId: admin.id,
      qq: admin.qq,
      isOwner: admin.is_owner
    });
    
  } catch (error: any) {
    console.error('登录失败:', error);
    return NextResponse.json(
      { success: false, message: '登录失败: ' + (error.message || '未知错误') },
      { status: 500 }
    );
  }
}
