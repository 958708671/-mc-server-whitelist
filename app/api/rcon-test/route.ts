import { NextRequest, NextResponse } from 'next/server';
import { addToWhitelist } from '@/lib/rcon';

export async function POST(request: NextRequest) {
  try {
    const { host, port, password } = await request.json();
    
    if (!host || !password) {
      return NextResponse.json(
        { success: false, message: '缺少主机地址或密码' },
        { status: 400 }
      );
    }
    
    // 测试连接 - 尝试添加一个不存在的玩家来测试连接
    const result = await addToWhitelist(host, port || 25575, password, '__test_connection__');
    
    // 如果连接成功，即使玩家不存在也算成功
    if (result.success || result.message.includes('连接')) {
      return NextResponse.json({
        success: true,
        message: 'RCON连接成功'
      });
    }
    
    return NextResponse.json({
      success: false,
      message: result.message
    });
    
  } catch (error: any) {
    console.error('RCON测试失败:', error);
    return NextResponse.json({
      success: false,
      message: error.message || '连接失败'
    });
  }
}
