import { NextRequest, NextResponse } from 'next/server';
import {
  syncDownFromRealDb,
  syncUpToRealDb,
  performAutoSync,
  getSyncStatus,
  checkRealDbConnection
} from '@/lib/db-sync';

// 获取同步状态
export async function GET() {
  try {
    const isConnected = await checkRealDbConnection();
    const status = getSyncStatus();
    
    return NextResponse.json({
      success: true,
      isConnected,
      ...status
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// 执行同步
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { direction = 'auto' } = body;
    
    const isConnected = await checkRealDbConnection();
    
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        message: '真实数据库连接失败，无法同步',
        isConnected: false
      }, { status: 503 });
    }
    
    let result;
    
    switch (direction) {
      case 'down':
        result = await syncDownFromRealDb();
        break;
      case 'up':
        result = await syncUpToRealDb();
        break;
      case 'auto':
      default:
        result = await performAutoSync();
        break;
    }
    
    return NextResponse.json({
      ...result,
      isConnected: true
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: '同步失败',
      error: error.message,
      isConnected: false
    }, { status: 500 });
  }
}
