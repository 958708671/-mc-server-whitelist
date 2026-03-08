import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '');

export async function POST(request: NextRequest) {
  try {
    const { adminId, oldPassword, newPassword } = await request.json();
    
    if (!adminId || !oldPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: '参数不完整' },
        { status: 400 }
      );
    }
    
    const admins = await sql`
      SELECT id, username, password FROM admins WHERE id = ${adminId}
    `;
    
    if (admins.length === 0) {
      return NextResponse.json(
        { success: false, message: '管理员不存在' },
        { status: 404 }
      );
    }
    
    const admin = admins[0];
    
    if (admin.password !== oldPassword) {
      return NextResponse.json(
        { success: false, message: '原密码错误' },
        { status: 400 }
      );
    }
    
    await sql`
      UPDATE admins SET password = ${newPassword} WHERE id = ${adminId}
    `;
    
    try {
      const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0].trim() 
        || request.headers.get('x-real-ip') 
        || 'unknown';
      
      await sql`
        INSERT INTO admin_logs (admin_id, action, details, ip_address, created_at)
        VALUES (${adminId}, 'change_password', ${`管理员修改了密码`}, ${clientIP}, NOW())
      `;
    } catch (logError) {
      console.error('记录日志失败:', logError);
    }
    
    return NextResponse.json({
      success: true,
      message: '密码修改成功'
    });
    
  } catch (error) {
    console.error('修改密码失败:', error);
    return NextResponse.json(
      { success: false, message: '修改密码失败' },
      { status: 500 }
    );
  }
}
