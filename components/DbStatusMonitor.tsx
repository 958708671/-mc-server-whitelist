'use client';

import { useState, useEffect, useCallback } from 'react';

interface DbStatus {
  connected: boolean;
  lastCheck: string;
  reconnecting: boolean;
}

export default function DbStatusMonitor() {
  const [status, setStatus] = useState<DbStatus>({
    connected: true,
    lastCheck: '',
    reconnecting: false
  });
  const [showConnectionError, setShowConnectionError] = useState(false);

  const checkDbStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/db-status');
      const data = await res.json();
      
      setStatus(prev => ({
        ...prev,
        connected: data.success,
        lastCheck: new Date().toLocaleTimeString()
      }));
      
      if (!data.success) {
        setShowConnectionError(true);
      }
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        connected: false,
        lastCheck: new Date().toLocaleTimeString()
      }));
      setShowConnectionError(true);
    }
  }, []);

  const tryReconnect = useCallback(async () => {
    if (status.reconnecting || status.connected) return;
    
    setStatus(prev => ({ ...prev, reconnecting: true }));
    
    try {
      const res = await fetch('/api/db-status');
      const data = await res.json();
      
      if (data.success) {
        setStatus(prev => ({
          ...prev,
          connected: true,
          reconnecting: false
        }));
        setShowConnectionError(false);
        
        // 刷新页面
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.log('[自动重连] 重连失败');
    } finally {
      setStatus(prev => ({ ...prev, reconnecting: false }));
    }
  }, [status.reconnecting, status.connected]);

  // 初始化网络监控
  useEffect(() => {
    checkDbStatus();
    
    // 每30秒检查一次数据库状态
    const interval = setInterval(checkDbStatus, 30000);
    return () => clearInterval(interval);
  }, [checkDbStatus]);

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
                <p className="text-gray-600">请检查数据库连接配置和服务状态</p>
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

      {/* 右上角悬浮图标 */}
      {!status.connected && (
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
                <p className="text-sm opacity-90 mt-1">请检查数据库连接配置和服务状态</p>
                
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={tryReconnect}
                    disabled={status.reconnecting}
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
          </div>
        </div>
      )}
    </>
  );
}
