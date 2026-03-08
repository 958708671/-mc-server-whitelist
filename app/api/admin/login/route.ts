import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// 获取数据库连接
const getSql = () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL not set');
  }
  return neon(databaseUrl);
};

// 获取客户端IP地址
const getClientIP = (request: NextRequest): string => {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
};

// 管理员登录接口
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    const clientIP = getClientIP(request);
    
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: '请输入用户名和密码' },
        { status: 400 }
      );
    }
    
    const sql = getSql();
    
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
    
    // 记录登录日志（包含IP地址）
    try {
      const sqlLog = getSql();
      const roleText = admin.is_owner ? '服主' : '管理员';
      // 如果 display_name 已经包含角色信息，只使用 display_name
      const displayName = admin.display_name || admin.username;
      const details = displayName === roleText 
        ? `${displayName} 登录成功`
        : `${roleText} ${displayName} 登录成功`;
      await sqlLog`
        INSERT INTO admin_logs (admin_id, action, details, ip_address, created_at)
        VALUES (${admin.id}, 'login', ${details}, ${clientIP}, NOW())
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
