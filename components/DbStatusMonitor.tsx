'use client';

import { useState, useEffect, useCallback } from 'react';

interface DbStatus {
  connected: boolean;
  mockMode: boolean;
  syncing: boolean;
  lastCheck: string;
  reconnecting: boolean;
  countdown: number;
}

export default function DbStatusMonitor() {
  const [status, setStatus] = useState<DbStatus>({
    connected: true,
    mockMode: false,
    syncing: false,
    lastCheck: '',
    reconnecting: false,
    countdown: 30
  });
  const [showBanner, setShowBanner] = useState(false);
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
      
      if (newMockMode) {
        setShowBanner(true);
      }
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        connected: false,
        mockMode: true,
        lastCheck: new Date().toLocaleTimeString()
      }));
      setShowBanner(true);
    }
  }, []);

  const tryReconnect = useCallback(async () => {
    if (status.syncing || status.connected) return;
    
    setStatus(prev => ({ ...prev, reconnecting: true }));
    
    try {
      const res = await fetch('/api/db-status', { method: 'POST' });
      const data = await res.json();
      
      if (data.connected) {
        await syncFromMockToReal();
      }
    } catch (error) {
      console.log('[自动重连] 重连失败');
    } finally {
      setStatus(prev => ({ ...prev, reconnecting: false, countdown: 30 }));
    }
  }, [status.syncing, status.connected]);

  const syncFromMockToReal = async () => {
    setStatus(prev => ({ ...prev, syncing: true }));
    
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
          countdown: 30
        }));
        setShowBanner(false);
        
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

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 px-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="animate-pulse">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="font-bold">⚠️ 数据库连接失败，已自动开启模拟数据库</p>
            <p className="text-sm opacity-90">
              {status.reconnecting ? (
                <span className="animate-pulse">正在尝试重连...</span>
              ) : status.syncing ? (
                <span className="animate-pulse">正在同步数据...</span>
              ) : (
                <span>下次自动重连倒计时: {status.countdown}秒</span>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={tryReconnect}
            disabled={status.reconnecting || status.syncing}
            className="px-4 py-1.5 bg-white text-red-600 rounded-lg font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {status.reconnecting ? '重连中...' : '立即重连'}
          </button>
          <button
            onClick={() => setShowBanner(false)}
            className="px-3 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-all"
          >
            关闭
          </button>
        </div>
      </div>
      
      {syncResult && (
        <div className="mt-2 pt-2 border-t border-white/20 text-sm">
          <p className="font-medium">✅ 数据同步完成</p>
          <p>处理了 {syncResult.syncedCount} 个操作</p>
        </div>
      )}
    </div>
  );
}
