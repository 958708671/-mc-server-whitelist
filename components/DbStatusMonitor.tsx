'use client';

import { useState, useEffect, useCallback } from 'react';

interface DbStatus {
  connected: boolean;
  mockMode: boolean;
  syncing: boolean;
  lastCheck: string;
  reconnecting: boolean;
  countdown: number;
  syncRequired: boolean;
  pendingSyncCount: number;
}

export default function DbStatusMonitor() {
  const [status, setStatus] = useState<DbStatus>({
    connected: true,
    mockMode: false,
    syncing: false,
    lastCheck: '',
    reconnecting: false,
    countdown: 30,
    syncRequired: false,
    pendingSyncCount: 0
  });
  const [showBanner, setShowBanner] = useState(false);
  const [showSyncConfirm, setShowSyncConfirm] = useState(false);
  const [showConnectionError, setShowConnectionError] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);

  const checkDbStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/db-status');
      const data = await res.json();
      
      const newMockMode = !data.connected;
      
      setStatus(prev => ({
        ...prev,
        connected: data.connected,
        mockMode: newMockMode,
        lastCheck: new Date().toLocaleTimeString()
      }));
      
      if (newMockMode && !status.mockMode) {
        setShowConnectionError(true);
      }
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        connected: false,
        mockMode: true,
        lastCheck: new Date().toLocaleTimeString()
      }));
      setShowConnectionError(true);
    }
  }, [status.mockMode]);

  const checkSyncStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/sync?action=status');
      const data = await res.json();
      
      if (data.data && data.data.pendingSyncCount > 0) {
        setStatus(prev => ({
          ...prev,
          syncRequired: true,
          pendingSyncCount: data.data.pendingSyncCount
        }));
        setShowSyncConfirm(true);
      }
    } catch (error) {
      console.error('检查同步状态失败:', error);
    }
  }, []);

  const tryReconnect = useCallback(async () => {
    if (status.syncing || status.connected) return;
    
    setStatus(prev => ({ ...prev, reconnecting: true }));
    
    try {
      const res = await fetch('/api/db-status');
      const data = await res.json();
      
      if (data.connected) {
        // 检查是否有需要同步的数据
        const syncRes = await fetch('/api/sync?action=status');
        const syncData = await syncRes.json();
        
        if (syncData.data && syncData.data.pendingSyncCount > 0) {
          setStatus(prev => ({
            ...prev,
            syncRequired: true,
            pendingSyncCount: syncData.data.pendingSyncCount
          }));
          setShowSyncConfirm(true);
        } else {
          // 切换回真实数据库
          setForceMockDb(false);
          setStatus(prev => ({
            ...prev,
            connected: true,
            mockMode: false,
            reconnecting: false,
            countdown: 30
          }));
          setShowConnectionError(false);
          
          // 刷新页面
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }
    } catch (error) {
      console.log('[自动重连] 重连失败');
    } finally {
      setStatus(prev => ({ ...prev, reconnecting: false, countdown: 30 }));
    }
  }, [status.syncing, status.connected]);

  const confirmSync = async () => {
    setStatus(prev => ({ ...prev, syncing: true }));
    setShowSyncConfirm(false);
    
    try {
      const res = await fetch('/api/sync?action=sync-mock-to-real');
      const data = await res.json();
      
      if (data.success) {
        setSyncResult(data);
        setStatus(prev => ({
          ...prev,
          connected: true,
          mockMode: false,
          syncing: false,
          syncRequired: false,
          countdown: 30
        }));
        setShowConnectionError(false);
        
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setStatus(prev => ({ ...prev, syncing: false }));
      }
    } catch (error) {
      setStatus(prev => ({ ...prev, syncing: false }));
    }
  };

  const cancelSync = () => {
    setShowSyncConfirm(false);
    setStatus(prev => ({ ...prev, syncRequired: false }));
  };

  const setForceMockDb = useCallback(async (value: boolean) => {
    try {
      await fetch('/api/dev/mock-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ force: value })
      });
    } catch (error) {
      console.error('设置模拟数据库状态失败:', error);
    }
  }, []);

  // 初始化同步和网络监控
  useEffect(() => {
    // 初始化同步
    const initSync = async () => {
      try {
        await fetch('/api/sync?action=sync-real-to-mock');
        console.log('[数据库同步] 初始化同步完成');
      } catch (error) {
        console.error('[数据库同步] 初始化同步失败:', error);
      }
    };

    initSync();
    checkDbStatus();
  }, [checkDbStatus]);

  useEffect(() => {
    if (!status.mockMode || status.connected) return;
    
    const countdownTimer = setInterval(() => {
      setStatus(prev => {
        if (prev.countdown <= 1) {
          return { ...prev, countdown: 30 };
        }
        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);
    
    const reconnectTimer = setInterval(() => {
      if (!status.connected && status.mockMode) {
        tryReconnect();
      }
    }, 30000);
    
    return () => {
      clearInterval(countdownTimer);
      clearInterval(reconnectTimer);
    };
  }, [status.mockMode, status.connected, tryReconnect]);

  return (
    <>
      {/* 连接错误弹窗 */}
      {showConnectionError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">数据库连接失败</h3>
                <p className="text-gray-600">系统已自动切换到模拟数据库，所有功能仍可正常使用</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setShowConnectionError(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                关闭
              </button>
              <button
                onClick={tryReconnect}
                disabled={status.reconnecting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {status.reconnecting ? '重连中...' : '立即重连'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 同步确认弹窗 */}
      {showSyncConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">数据同步确认</h3>
                <p className="text-gray-600">检测到模拟数据库中有 {status.pendingSyncCount} 个操作需要同步到真实数据库</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={cancelSync}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmSync}
                disabled={status.syncing}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {status.syncing ? '同步中...' : '确认同步'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 右上角悬浮图标 */}
      {status.mockMode && (
        <div className="fixed top-4 right-4 z-[9999] group">
          {/* 小型警示图标 */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-3 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-all duration-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          {/* 悬停时显示的详细信息 */}
          <div className="absolute top-full right-0 mt-2 bg-gray-900 text-white p-4 rounded-lg shadow-2xl w-80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[10000]">
            <div className="flex items-start gap-3">
              <div className="animate-pulse flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-bold text-red-400">⚠️ 数据库连接失败</p>
                <p className="text-sm opacity-90 mt-1">已自动开启模拟数据库，系统仍可正常使用</p>
                <p className="text-sm opacity-90 mt-2">
                  {status.reconnecting ? (
                    <span className="animate-pulse">正在尝试重连...</span>
                  ) : status.syncing ? (
                    <span className="animate-pulse">正在同步数据...</span>
                  ) : (
                    <span>下次自动重连倒计时: {status.countdown}秒</span>
                  )}
                </p>
                
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={tryReconnect}
                    disabled={status.reconnecting || status.syncing}
                    className="px-3 py-1 bg-red-600 text-white rounded font-medium text-xs hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {status.reconnecting ? '重连中...' : '立即重连'}
                  </button>
                  <button
                    onClick={() => setShowConnectionError(false)}
                    className="px-3 py-1 bg-gray-700 text-white rounded font-medium text-xs hover:bg-gray-600 transition-all"
                  >
                    关闭
                  </button>
                </div>
              </div>
            </div>
            
            {syncResult && (
              <div className="mt-3 pt-3 border-t border-gray-700 text-xs">
                <p className="font-medium text-green-400">✅ 数据同步完成</p>
                <p>处理了 {syncResult.syncedCount} 个操作</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
