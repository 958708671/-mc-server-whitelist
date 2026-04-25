import { NextRequest, NextResponse } from 'next/server';
import sql, { withRetry } from '@/lib/db';
import { setSessionCookie } from '@/lib/auth';
import bcrypt from 'bcryptjs';

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
    
    // 查询管理员 - 支持用 username 或 qq 登录（使用重试机制）
    const admins = await withRetry(async () => {
      return await sql`
        SELECT id, username, display_name, qq, is_owner, password FROM admins 
        WHERE (username = ${username} OR qq = ${username})
      `;
    });
    
    if (admins.length === 0) {
      return NextResponse.json(
        { success: false, message: '用户名或密码错误' },
        { status: 401 }
      );
    }
    
    const admin = admins[0];
    const storedPassword: string = admin.password;
    
    // 判断密码是否已哈希（bcrypt hash 以 $2b$ 或 $2a$ 开头）
    const isHashed = storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2a$');
    let passwordValid = false;
    
    if (isHashed) {
      passwordValid = await bcrypt.compare(password, storedPassword);
    } else {
      // 旧明文密码：直接比较，验证通过后自动升级为 bcrypt hash
      passwordValid = storedPassword === password;
      if (passwordValid) {
        // 自动升级为 bcrypt hash
        const hashed = await bcrypt.hash(password, 12);
        await withRetry(async () => {
          return await sql`UPDATE admins SET password = ${hashed} WHERE id = ${admin.id}`;
        });
        console.log(`[Auth] 已将管理员 ${admin.username} 的密码升级为 bcrypt 哈希`);
      }
    }
    
    if (!passwordValid) {
      return NextResponse.json(
        { success: false, message: '用户名或密码错误' },
        { status: 401 }
      );
    }
    
    // 记录登录日志（包含IP地址）
    try {
      const roleText = admin.is_owner ? '服主' : '管理员';
      // 如果 display_name 已经包含角色信息，只使用 display_name
      const displayName = admin.display_name || admin.username;
      const details = displayName === roleText 
        ? `${displayName} 登录成功`
        : `${roleText} ${displayName} 登录成功`;
      
      await withRetry(async () => {
        return await sql`
          INSERT INTO admin_logs (admin_id, action, details, ip_address, created_at)
          VALUES (${admin.id}, 'login', ${details}, ${clientIP}, NOW())
        `;
      });
    } catch (logError) {
      console.error('记录登录日志失败:', logError);
    }
    
    const responseBody = {
      success: true,
      user: admin.username,
      adminId: admin.id,
      qq: admin.qq,
      isOwner: admin.is_owner,
    };
    
    const response = NextResponse.json(responseBody);
    // 设置 httpOnly session cookie
    setSessionCookie(response, {
      adminId: admin.id,
      username: admin.username,
      isOwner: Boolean(admin.is_owner),
      qq: admin.qq || '',
    });
    return response;
    
  } catch (error: any) {
    console.error('登录失败:', error);
    return NextResponse.json(
      { success: false, message: '登录失败，请检查用户名和密码' },
      { status: 500 }
    );
  }
}
