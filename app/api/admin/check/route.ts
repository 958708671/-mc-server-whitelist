import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('管理员检查API被调用');
    console.log('请求cookies:', request.cookies.getAll());
    
    const session = getSession(request);
    console.log('获取到的session:', session);
    
    return NextResponse.json({
      success: true,
      isAdmin: !!session
    });
  } catch (error) {
    console.error('检查管理员状态失败:', error);
    return NextResponse.json({
      success: false,
      isAdmin: false
    });
  }
}