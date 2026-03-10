// 数据库同步模块
import sql, { withRetry } from './db';
import { 
  mockApplications, 
  mockAnnouncements, 
  mockEvents, 
  mockBlacklist, 
  setForceMockDb, 
  getOperationLogs, 
  clearOperationLogs,
  setLastSyncTime,
  getLastSyncTime
} from './mock-db';

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

// 从真实数据库同步到模拟数据库
export async function syncFromRealToMock(): Promise<{ success: boolean; message: string }> {
  if (syncState.isSyncing) {
    return { success: false, message: '同步正在进行中' };
  }

  syncState.isSyncing = true;
  syncState.syncError = null;

  try {
    console.log('[数据库同步] 开始从真实数据库同步到模拟数据库');

    // 同步白名单申请
    await syncApplications();

    // 同步公告
    await syncAnnouncements();

    // 同步活动
    await syncEvents();

    // 同步黑名单
    await syncBlacklist();

    const now = new Date();
    syncState.lastSync = now;
    setLastSyncTime(now);
    console.log('[数据库同步] 同步完成');

    return { success: true, message: '同步完成' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    syncState.syncError = errorMessage;
    console.error('[数据库同步] 同步失败:', errorMessage);
    return { success: false, message: `同步失败: ${errorMessage}` };
  } finally {
    syncState.isSyncing = false;
  }
}

// 从模拟数据库同步到真实数据库
export async function syncFromMockToReal(): Promise<{ success: boolean; message: string; syncedCount: number }> {
  if (syncState.isSyncing) {
    return { success: false, message: '同步正在进行中', syncedCount: 0 };
  }

  syncState.isSyncing = true;
  syncState.syncError = null;

  try {
    console.log('[数据库同步] 开始从模拟数据库同步到真实数据库');

    const logs = getOperationLogs();
    let syncedCount = 0;

    // 按时间顺序处理操作日志
    for (const log of logs) {
      try {
        await processOperationLog(log);
        syncedCount++;
      } catch (error) {
        console.error(`[数据库同步] 处理操作日志失败 (${log.id}):`, error);
      }
    }

    // 清空操作日志
    clearOperationLogs();

    const now = new Date();
    syncState.lastSync = now;
    setLastSyncTime(now);
    console.log(`[数据库同步] 同步完成，处理了 ${syncedCount} 个操作`);

    return { success: true, message: `同步完成，处理了 ${syncedCount} 个操作`, syncedCount };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    syncState.syncError = errorMessage;
    console.error('[数据库同步] 同步失败:', errorMessage);
    return { success: false, message: `同步失败: ${errorMessage}`, syncedCount: 0 };
  } finally {
    syncState.isSyncing = false;
  }
}

// 处理操作日志
async function processOperationLog(log: any) {
  switch (log.table) {
    case 'whitelist_applications':
      await processWhitelistApplicationLog(log);
      break;
    case 'announcements':
      await processAnnouncementLog(log);
      break;
    case 'events':
      await processEventLog(log);
      break;
    case 'blacklist':
      await processBlacklistLog(log);
      break;
    default:
      console.log(`[数据库同步] 跳过未知表的操作: ${log.table}`);
  }
}

// 处理白名单申请操作
async function processWhitelistApplicationLog(log: any) {
  switch (log.operation) {
    case 'insert':
      await sql`
        INSERT INTO whitelist_applications (minecraft_id, age, contact, status, created_at, reviewed_by, reviewed_by_id, review_note, reviewed_at)
        VALUES (${log.data.minecraft_id}, ${log.data.age}, ${log.data.contact}, ${log.data.status}, ${log.data.created_at}, ${log.data.reviewed_by}, ${log.data.reviewed_by_id}, ${log.data.review_note}, ${log.data.reviewed_at})
      `;
      break;
    case 'update':
      await sql`
        UPDATE whitelist_applications
        SET status = ${log.data.status}, reviewed_by = ${log.data.reviewed_by}, reviewed_by_id = ${log.data.reviewed_by_id}, review_note = ${log.data.review_note}, reviewed_at = ${log.data.reviewed_at}
        WHERE id = ${log.data.id}
      `;
      break;
  }
}

// 处理公告操作
async function processAnnouncementLog(log: any) {
  if (log.operation === 'insert') {
    await sql`
      INSERT INTO announcements (title, content, author, author_id, is_published, created_at, updated_at)
      VALUES (${log.data.title}, ${log.data.content}, ${log.data.author}, ${log.data.author_id}, ${log.data.is_published}, ${log.data.created_at}, ${log.data.updated_at})
    `;
  }
}

// 处理活动操作
async function processEventLog(log: any) {
  if (log.operation === 'insert') {
    await sql`
      INSERT INTO events (title, description, start_time, end_time, location, max_participants, organizer, created_at, updated_at)
      VALUES (${log.data.title}, ${log.data.description}, ${log.data.start_time}, ${log.data.end_time}, ${log.data.location}, ${log.data.max_participants}, ${log.data.organizer}, ${log.data.created_at}, ${log.data.updated_at})
    `;
  }
}

// 处理黑名单操作
async function processBlacklistLog(log: any) {
  switch (log.operation) {
    case 'insert':
      await sql`
        INSERT INTO blacklist (minecraft_id, ip_address, reason, banned_by, banned_by_id, is_permanent, duration_minutes, expires_at, is_active, created_at)
        VALUES (${log.data.minecraft_id}, ${log.data.ip_address}, ${log.data.reason}, ${log.data.banned_by}, ${log.data.banned_by_id}, ${log.data.is_permanent}, ${log.data.duration_minutes}, ${log.data.expires_at}, ${log.data.is_active}, ${log.data.created_at})
      `;
      break;
    case 'update':
      await sql`
        UPDATE blacklist
        SET is_active = ${log.data.is_active}
        WHERE id = ${log.data.id}
      `;
      break;
  }
}

// 同步白名单申请
async function syncApplications() {
  try {
    const applications = await withRetry(async () => {
      return await sql`
        SELECT id, minecraft_id, age, contact, status, reviewed_by, reviewed_by_id, review_note, reviewed_at, created_at
        FROM whitelist_applications
        ORDER BY created_at DESC
      `;
    });

    // 清空模拟数据并重新填充
    mockApplications.length = 0;
    mockApplications.push(...applications);
    console.log(`[数据库同步] 同步白名单申请: ${applications.length} 条`);
  } catch (error) {
    console.error('[数据库同步] 同步白名单申请失败:', error);
  }
}

// 同步公告
async function syncAnnouncements() {
  try {
    const announcements = await withRetry(async () => {
      return await sql`
        SELECT id, title, content, author, author_id, is_published, created_at, updated_at
        FROM announcements
        ORDER BY created_at DESC
      `;
    });

    // 清空模拟数据并重新填充
    mockAnnouncements.length = 0;
    mockAnnouncements.push(...announcements);
    console.log(`[数据库同步] 同步公告: ${announcements.length} 条`);
  } catch (error) {
    console.error('[数据库同步] 同步公告失败:', error);
  }
}

// 同步活动
async function syncEvents() {
  try {
    const events = await withRetry(async () => {
      return await sql`
        SELECT id, title, description, start_time, end_time, location, max_participants, organizer, created_at, updated_at
        FROM events
        ORDER BY start_time DESC
      `;
    });

    // 清空模拟数据并重新填充
    mockEvents.length = 0;
    mockEvents.push(...events);
    console.log(`[数据库同步] 同步活动: ${events.length} 条`);
  } catch (error) {
    console.error('[数据库同步] 同步活动失败:', error);
  }
}

// 同步黑名单
async function syncBlacklist() {
  try {
    const blacklist = await withRetry(async () => {
      return await sql`
        SELECT id, minecraft_id, ip_address, reason, banned_by, banned_by_id, is_permanent, duration_minutes, expires_at, is_active, created_at
        FROM blacklist
        WHERE is_active = TRUE
        ORDER BY created_at DESC
      `;
    });

    // 清空模拟数据并重新填充
    mockBlacklist.length = 0;
    mockBlacklist.push(...blacklist);
    console.log(`[数据库同步] 同步黑名单: ${blacklist.length} 条`);
  } catch (error) {
    console.error('[数据库同步] 同步黑名单失败:', error);
  }
}

// 获取同步状态
export function getSyncState(): SyncState {
  return { ...syncState };
}

// 初始化同步
export async function initializeSync() {
  console.log('[数据库同步] 初始化同步');
  await syncFromRealToMock();
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

// 网络状态检测和自动切换
export async function startNetworkMonitor() {
  console.log('[网络监控] 启动网络状态检测');
  
  // 启动定期从真实数据库同步到模拟数据库的任务
  setInterval(async () => {
    const isConnected = await checkDbConnection();
    if (isConnected) {
      console.log('[数据库同步] 定期从真实数据库同步到模拟数据库');
      await syncFromRealToMock();
    }
  }, 60000); // 每60秒同步一次
  
  setInterval(async () => {
    const isConnected = await checkDbConnection();
    
    if (isConnected) {
      // 网络已恢复，检查是否需要从模拟数据库同步到真实数据库
      const logs = getOperationLogs();
      if (logs.length > 0) {
        console.log('[网络监控] 网络已恢复，开始同步模拟数据库到真实数据库');
        await syncFromMockToReal();
        
        // 切换回真实数据库
        setForceMockDb(false);
        console.log('[网络监控] 已切换回真实数据库');
      }
    }
  }, 30000); // 每30秒检测一次
}