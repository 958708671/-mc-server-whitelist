import sql from './db';
import {
  loadMockDb,
  saveMockDb,
  MockApplication,
  MockWhitelist,
  setLastSyncTime,
  getLastSyncInfo,
  MockDbData
} from './mock-db';

export interface SyncResult {
  success: boolean;
  direction: 'up' | 'down' | 'none';
  applicationsSynced: number;
  whitelistSynced: number;
  message: string;
  error?: string;
}

export async function syncDownFromRealDb(): Promise<SyncResult> {
  console.log('[同步] 开始从真实数据库同步到模拟数据库...');
  
  try {
    const [applications, whitelist] = await Promise.all([
      sql`SELECT * FROM applications ORDER BY submitted_at DESC`,
      sql`SELECT * FROM whitelist ORDER BY added_at DESC`
    ]);
    
    const mockData: MockDbData = {
      applications: applications.map((app: any) => ({
        id: app.id,
        username: app.username,
        qq: app.qq,
        xuid: app.xuid,
        status: app.status,
        submitted_at: app.submitted_at,
        reviewed_at: app.reviewed_at,
        reviewed_by: app.reviewed_by,
        reject_reason: app.reject_reason
      })),
      whitelist: whitelist.map((entry: any) => ({
        id: entry.id,
        username: entry.username,
        xuid: entry.xuid,
        added_at: entry.added_at,
        added_by: entry.added_by
      })),
      admins: [],
      lastSync: new Date().toISOString(),
      syncDirection: 'down'
    };
    
    saveMockDb(mockData);
    setLastSyncTime('down');
    
    console.log(`[同步] 下载完成: ${applications.length} 条申请, ${whitelist.length} 条白名单`);
    
    return {
      success: true,
      direction: 'down',
      applicationsSynced: applications.length,
      whitelistSynced: whitelist.length,
      message: `成功从真实数据库同步: ${applications.length} 条申请, ${whitelist.length} 条白名单`
    };
  } catch (error: any) {
    console.error('[同步] 下载失败:', error);
    return {
      success: false,
      direction: 'none',
      applicationsSynced: 0,
      whitelistSynced: 0,
      message: '同步失败',
      error: error.message
    };
  }
}

export async function syncUpToRealDb(): Promise<SyncResult> {
  console.log('[同步] 开始从模拟数据库同步到真实数据库...');
  
  try {
    const mockData = loadMockDb();
    let applicationsSynced = 0;
    let whitelistSynced = 0;
    
    // 同步申请数据
    for (const app of mockData.applications) {
      try {
        const existing = await sql`SELECT id FROM applications WHERE id = ${app.id}`;
        
        if (existing.length === 0) {
          // 插入新记录
          await sql`
            INSERT INTO applications (username, qq, xuid, status, submitted_at, reviewed_at, reviewed_by, reject_reason)
            VALUES (${app.username}, ${app.qq}, ${app.xuid}, ${app.status}, ${app.submitted_at}, ${app.reviewed_at}, ${app.reviewed_by}, ${app.reject_reason})
          `;
          applicationsSynced++;
        } else {
          // 更新现有记录
          await sql`
            UPDATE applications 
            SET status = ${app.status}, 
                reviewed_at = ${app.reviewed_at}, 
                reviewed_by = ${app.reviewed_by},
                reject_reason = ${app.reject_reason}
            WHERE id = ${app.id}
          `;
          applicationsSynced++;
        }
      } catch (err) {
        console.error(`[同步] 同步申请 ${app.username} 失败:`, err);
      }
    }
    
    // 同步白名单数据
    for (const entry of mockData.whitelist) {
      try {
        const existing = await sql`SELECT id FROM whitelist WHERE username = ${entry.username}`;
        
        if (existing.length === 0) {
          await sql`
            INSERT INTO whitelist (username, xuid, added_at, added_by)
            VALUES (${entry.username}, ${entry.xuid}, ${entry.added_at}, ${entry.added_by})
          `;
          whitelistSynced++;
        }
      } catch (err) {
        console.error(`[同步] 同步白名单 ${entry.username} 失败:`, err);
      }
    }
    
    setLastSyncTime('up');
    
    console.log(`[同步] 上传完成: ${applicationsSynced} 条申请, ${whitelistSynced} 条白名单`);
    
    return {
      success: true,
      direction: 'up',
      applicationsSynced,
      whitelistSynced,
      message: `成功同步到真实数据库: ${applicationsSynced} 条申请, ${whitelistSynced} 条白名单`
    };
  } catch (error: any) {
    console.error('[同步] 上传失败:', error);
    return {
      success: false,
      direction: 'none',
      applicationsSynced: 0,
      whitelistSynced: 0,
      message: '同步失败',
      error: error.message
    };
  }
}

export async function performAutoSync(): Promise<SyncResult> {
  const lastSync = getLastSyncInfo();
  
  // 如果模拟数据库为空，从真实数据库下载
  const mockData = loadMockDb();
  if (mockData.applications.length === 0 && mockData.whitelist.length === 0) {
    console.log('[同步] 模拟数据库为空，执行首次同步...');
    return await syncDownFromRealDb();
  }
  
  // 如果有本地修改（根据时间戳判断），优先上传
  if (lastSync.direction === 'up' || lastSync.time === null) {
    return await syncUpToRealDb();
  }
  
  // 否则双向同步：先下载再上传
  const downloadResult = await syncDownFromRealDb();
  if (downloadResult.success) {
    return await syncUpToRealDb();
  }
  
  return downloadResult;
}

export function getSyncStatus(): {
  lastSync: string | null;
  direction: string;
  mockDataCount: { applications: number; whitelist: number };
} {
  const lastSync = getLastSyncInfo();
  const mockData = loadMockDb();
  
  return {
    lastSync: lastSync.time,
    direction: lastSync.direction,
    mockDataCount: {
      applications: mockData.applications.length,
      whitelist: mockData.whitelist.length
    }
  };
}

export async function checkRealDbConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
