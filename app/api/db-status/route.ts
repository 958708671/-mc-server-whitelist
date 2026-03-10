import { NextResponse } from 'next/server';
import sql, { resetDbConnectionStatus, isDbConnectionFailed } from '@/lib/db';

export async function GET() {
  try {
    await sql`SELECT 1 as test`;
    
    return NextResponse.json({
      success: true,
      connected: true,
      message: '数据库连接正常'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      connected: false,
      message: `数据库连接失败: ${error.message}`
    });
  }
}

export async function POST() {
  try {
    await sql`SELECT 1 as test`;
    
    resetDbConnectionStatus();
    
    return NextResponse.json({
      success: true,
      connected: true,
      message: '数据库连接已恢复'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      connected: false,
      message: `数据库连接失败: ${error.message}`
    });
  }
}
