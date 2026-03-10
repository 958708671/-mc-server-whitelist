import { NextRequest, NextResponse } from 'next/server';
import { setForceMockDb } from '@/lib/mock-db';

export async function GET() {
  const { shouldUseMockDb } = await import('@/lib/mock-db');
  return NextResponse.json({
    success: true,
    mockDatabase: shouldUseMockDb()
  });
}

export async function POST(request: NextRequest) {
  try {
    const { enabled } = await request.json();
    setForceMockDb(enabled);
    
    console.log(`模拟数据库模式: ${enabled ? '已启用' : '已禁用'}`);
    
    return NextResponse.json({
      success: true,
      mockDatabase: enabled,
      message: `模拟数据库模式已${enabled ? '启用' : '禁用'}`
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '切换失败' },
      { status: 500 }
    );
  }
}
