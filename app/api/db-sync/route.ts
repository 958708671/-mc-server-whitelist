import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST() {
  try {
    await sql`SELECT 1 as test`;
    
    console.log('[数据同步] 数据库连接正常');
    
    return NextResponse.json({
      success: true,
      message: '数据库连接正常，模拟数据库已移除'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: `数据库连接失败: ${error.message}`
    });
  }
}
