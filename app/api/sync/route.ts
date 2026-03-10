// API路由 - 数据库同步
import { NextRequest, NextResponse } from 'next/server';
import { syncFromRealToMock, syncFromMockToReal, getSyncState, checkDbConnection } from '@/lib/db-sync';

export async function GET(request: NextRequest) {
  try {
    const action = request.nextUrl.searchParams.get('action');
    
    switch (action) {
      case 'status':
        const state = getSyncState();
        const isConnected = await checkDbConnection();
        return NextResponse.json({
          success: true,
          data: {
            ...state,
            isConnected,
            pendingSyncCount: 0
          }
        });
        
      case 'sync-real-to-mock':
        const syncRealResult = await syncFromRealToMock();
        return NextResponse.json(syncRealResult);
        
      case 'sync-mock-to-real':
        const syncMockResult = await syncFromMockToReal();
        return NextResponse.json(syncMockResult);
        
      default:
        return NextResponse.json({
          success: false,
          message: '无效的操作'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('同步API错误:', error);
    return NextResponse.json({
      success: false,
      message: '服务器错误'
    }, { status: 500 });
  }
}