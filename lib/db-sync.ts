// 数据库同步模块
import sql, { withRetry } from './db';

// 同步状态
interface SyncState {
  lastSync: Date | null;
  isSyncing: boolean;
  syncError: string | null;
}

let syncState: SyncState = {
  lastSync: null,
  isSyncing: false,
  syncError: null
};

// 从模拟数据库同步到真实数据库（保留接口以保持兼容性）
export async function syncFromMockToReal(): Promise<{ success: boolean; message: string; syncedCount: number }> {
  return { success: true, message: '模拟数据库已移除', syncedCount: 0 };
}

// 从真实数据库同步到模拟数据库（保留接口以保持兼容性）
export async function syncFromRealToMock(): Promise<{ success: boolean; message: string }> {
  return { success: true, message: '模拟数据库已移除' };
}

// 获取同步状态
export function getSyncState(): SyncState {
  return { ...syncState };
}

// 初始化同步
export async function initializeSync() {
  console.log('[数据库同步] 初始化同步');
}

// 检测数据库连接状态
export async function checkDbConnection(): Promise<boolean> {
  try {
    await withRetry(async () => {
      await sql`SELECT 1`;
    });
    return true;
  } catch {
    return false;
  }
}

// 网络状态检测（简化版本，仅检测连接状态）
export async function startNetworkMonitor() {
  console.log('[网络监控] 启动网络状态检测');
  
  // 每30秒检测一次数据库连接状态
  setInterval(async () => {
    const isConnected = await checkDbConnection();
    if (!isConnected) {
      console.warn('[网络监控] 数据库连接失败');
    }
  }, 30000); // 每30秒检测一次
}