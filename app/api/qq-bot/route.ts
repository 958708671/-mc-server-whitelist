import { NextRequest, NextResponse } from 'next/server';
import { sendPrivateMessage, sendGroupMessage } from '@/lib/qq-bot';

// 发送测试消息
export async function POST(request: NextRequest) {
  try {
    const { type, targetId, content } = await request.json();
    
    if (!type || !targetId || !content) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      );
    }
    
    let result = false;
    
    if (type === 'private') {
      result = await sendPrivateMessage(targetId, content);
    } else if (type === 'group') {
      result = await sendGroupMessage(targetId, content);
    } else {
      return NextResponse.json(
        { success: false, message: '无效的消息类型' },
        { status: 400 }
      );
    }
    
    if (result) {
      return NextResponse.json({
        success: true,
        message: '消息发送成功'
      });
    } else {
      return NextResponse.json(
        { success: false, message: '消息发送失败' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('发送QQ消息失败:', error);
    return NextResponse.json(
      { success: false, message: '发送消息失败' },
      { status: 500 }
    );
  }
}

// 获取QQ机器人状态
export async function GET() {
  const appId = process.env.QQ_BOT_APP_ID;
  const token = process.env.QQ_BOT_TOKEN;
  const secret = process.env.QQ_BOT_SECRET;
  
  const isConfigured = !!(appId && token && secret);
  
  return NextResponse.json({
    success: true,
    data: {
      configured: isConfigured,
      sandbox: process.env.QQ_BOT_SANDBOX === 'true',
      hasAdminQQ: !!process.env.QQ_BOT_ADMIN_QQ
    }
  });
}
