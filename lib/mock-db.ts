// 模拟数据库 - 用于开发环境当真实数据库不可用时

interface MockAdmin {
  id: number;
  username: string;
  password: string;
  qq: string;
  display_name: string;
  is_owner: boolean;
  permissions: any;
  show_in_contact: boolean;
  show_in_logs: boolean;
}

// 操作类型
type OperationType = 'insert' | 'update' | 'delete';

// 操作日志接口
interface OperationLog {
  id: number;
  table: string;
  operation: OperationType;
  data: any;
  timestamp: Date;
  originalData?: any;
}

// 模拟管理员数据
const mockAdmins: MockAdmin[] = [
  {
    id: 1,
    username: '958708671',
    password: '95870867120260308',
    qq: '958708671',
    display_name: '服主',
    is_owner: true,
    permissions: {
      whitelist_review: true,
      complaint_handle: true,
      blacklist_manage: true,
      announcement_manage: true,
      event_manage: true,
      statistics_view: true,
      settings_view: true,
      website_edit: true,
      admin_manage: true,
      logs_view: true,
      monitor_view: true
    },
    show_in_contact: true,
    show_in_logs: true
  },
  {
    id: 2,
    username: '2801699303',
    password: '280169930320260308',
    qq: '2801699303',
    display_name: 'fly_yu',
    is_owner: false,
    permissions: {
      whitelist_review: true,
      complaint_handle: true,
      blacklist_manage: true,
      announcement_manage: true,
      event_manage: true,
      statistics_view: true,
      settings_view: false,
      website_edit: false,
      admin_manage: false,
      logs_view: false,
      monitor_view: false
    },
    show_in_contact: true,
    show_in_logs: true
  }
];

// 模拟服务器设置存储
export const mockServerSettings: Record<string, string> = {
  qq_group: '',
  client_download_url: '',
  rcon_host: '',
  rcon_port: '25575',
  rcon_password: '',
  server_ip: '',
  server_version: '1.20.4'
};

// 模拟白名单申请数据
export const mockApplications: any[] = [];

// 模拟公告数据
export const mockAnnouncements: any[] = [];

// 模拟活动数据
export const mockEvents: any[] = [];

// 模拟黑名单数据
export const mockBlacklist: any[] = [];

// 操作日志
const operationLogs: OperationLog[] = [];
let logId = 1;

// 记录操作日志
function logOperation(table: string, operation: OperationType, data: any, originalData?: any) {
  operationLogs.push({
    id: logId++,
    table,
    operation,
    data,
    timestamp: new Date(),
    originalData
  });
  console.log(`[Mock DB] 记录操作: ${operation} ${table}`, data);
}

// 获取操作日志
export function getOperationLogs(): OperationLog[] {
  return [...operationLogs];
}

// 清空操作日志
export function clearOperationLogs() {
  operationLogs.length = 0;
  logId = 1;
}

// 模拟 SQL 查询
export const mockSql = {
  async query(sql: string, params?: any[]): Promise<any[]> {
    console.log('[Mock DB] Query:', sql.substring(0, 100), '...');
    
    // 模拟管理员登录查询
    if (sql.includes('FROM admins') && sql.includes('WHERE')) {
      const username = params?.[0] || '';
      const password = params?.[params.length - 1] || '';
      
      const admin = mockAdmins.find(a => 
        (a.username === username || a.qq === username) && a.password === password
      );
      
      return admin ? [admin] : [];
    }
    
    // 模拟获取所有管理员
    if (sql.includes('FROM admins') && sql.includes('ORDER BY')) {
      return mockAdmins;
    }
    
    // 模拟插入日志
    if (sql.includes('INSERT INTO admin_logs')) {
      console.log('[Mock DB] Log inserted:', params);
      return [{ id: 1 }];
    }
    
    // 模拟服务器设置查询
    if (sql.includes('FROM server_settings')) {
      return Object.entries(mockServerSettings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value
      }));
    }
    
    // 模拟服务器设置插入/更新
    if (sql.includes('INSERT INTO server_settings') || sql.includes('server_settings')) {
      return [{ success: true }];
    }
    
    // 模拟白名单申请查询
    if (sql.includes('FROM whitelist_applications')) {
      if (sql.includes('WHERE id')) {
        const id = params?.[0];
        return mockApplications.filter(a => a.id === id);
      }
      if (sql.includes('status = \'approved\'')) {
        return mockApplications.filter(a => a.status === 'approved');
      }
      if (sql.includes('status = \'pending\'')) {
        return mockApplications.filter(a => a.status === 'pending');
      }
      return mockApplications;
    }
    
    // 模拟白名单申请插入
    if (sql.includes('INSERT INTO whitelist_applications')) {
      const newApp = {
        id: mockApplications.length + 1,
        minecraft_id: params?.[0],
        age: params?.[1],
        contact: params?.[2],
        status: 'pending',
        created_at: new Date().toISOString(),
        reviewed_by: null,
        reviewed_by_id: null,
        review_note: null,
        reviewed_at: null
      };
      mockApplications.push(newApp);
      logOperation('whitelist_applications', 'insert', newApp);
      return [{ id: newApp.id }];
    }
    
    // 模拟白名单申请更新
    if (sql.includes('UPDATE whitelist_applications')) {
      const id = params?.[params.length - 1];
      const app = mockApplications.find(a => a.id === id);
      if (app) {
        const originalData = { ...app };
        // 处理使用参数占位符的情况
        if (sql.includes('status = ?')) {
          const status = params?.[0];
          if (status === 'approved') {
            app.status = 'approved';
            app.reviewed_by = params?.[1];
            app.reviewed_by_id = params?.[2];
            app.review_note = params?.[3] || '';
            app.reviewed_at = new Date().toISOString();
          } else if (status === 'pending') {
            app.status = 'pending';
            app.reviewed_by = null;
            app.reviewed_by_id = null;
            app.review_note = null;
            app.reviewed_at = null;
          } else if (status === 'rejected') {
            app.status = 'rejected';
            app.reviewed_by = params?.[1];
            app.reviewed_by_id = params?.[2];
            app.review_note = params?.[3] || '';
            app.reviewed_at = new Date().toISOString();
          }
        } else if (sql.includes('status = \'approved\'')) {
          app.status = 'approved';
          app.reviewed_by = params?.[1];
          app.reviewed_by_id = params?.[2];
          app.review_note = params?.[3] || '';
          app.reviewed_at = new Date().toISOString();
        } else if (sql.includes('status = \'pending\'')) {
          app.status = 'pending';
          app.reviewed_by = null;
          app.reviewed_by_id = null;
          app.review_note = null;
          app.reviewed_at = null;
        } else if (sql.includes('status = \'rejected\'')) {
          app.status = 'rejected';
          app.reviewed_by = params?.[1];
          app.reviewed_by_id = params?.[2];
          app.review_note = params?.[3] || '';
          app.reviewed_at = new Date().toISOString();
        }
        logOperation('whitelist_applications', 'update', app, originalData);
        console.log('[Mock DB] Application updated:', app);
      }
      return [{ success: true }];
    }
    
    // 模拟公告查询
    if (sql.includes('FROM announcements')) {
      if (sql.includes('WHERE id')) {
        const id = params?.[0];
        return mockAnnouncements.filter(a => a.id === id);
      }
      return mockAnnouncements;
    }
    
    // 模拟公告插入
    if (sql.includes('INSERT INTO announcements')) {
      const newAnnouncement = {
        id: mockAnnouncements.length + 1,
        title: params?.[0],
        content: params?.[1],
        author: params?.[2],
        author_id: params?.[3],
        is_published: params?.[4] || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockAnnouncements.push(newAnnouncement);
      logOperation('announcements', 'insert', newAnnouncement);
      return [{ id: newAnnouncement.id }];
    }
    
    // 模拟活动查询
    if (sql.includes('FROM events')) {
      if (sql.includes('WHERE id')) {
        const id = params?.[0];
        return mockEvents.filter(e => e.id === id);
      }
      return mockEvents;
    }
    
    // 模拟活动插入
    if (sql.includes('INSERT INTO events')) {
      const newEvent = {
        id: mockEvents.length + 1,
        title: params?.[0],
        description: params?.[1],
        start_time: params?.[2],
        end_time: params?.[3],
        location: params?.[4],
        max_participants: params?.[5],
        organizer: params?.[6],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockEvents.push(newEvent);
      logOperation('events', 'insert', newEvent);
      return [{ id: newEvent.id }];
    }
    
    // 模拟黑名单查询
    if (sql.includes('FROM blacklist')) {
      if (sql.includes('WHERE id')) {
        const id = params?.[0];
        return mockBlacklist.filter(b => b.id === id);
      }
      return mockBlacklist;
    }
    
    // 模拟黑名单插入
    if (sql.includes('INSERT INTO blacklist')) {
      const newBlacklist = {
        id: mockBlacklist.length + 1,
        minecraft_id: params?.[0],
        ip_address: params?.[1],
        reason: params?.[2],
        banned_by: params?.[3],
        banned_by_id: params?.[4],
        is_permanent: params?.[5] || false,
        duration_minutes: params?.[6],
        expires_at: params?.[7],
        is_active: true,
        created_at: new Date().toISOString()
      };
      mockBlacklist.push(newBlacklist);
      logOperation('blacklist', 'insert', newBlacklist);
      return [{ id: newBlacklist.id }];
    }
    
    // 模拟黑名单删除/撤回
    if (sql.includes('DELETE FROM blacklist') || (sql.includes('UPDATE blacklist') && sql.includes('is_active = FALSE'))) {
      const id = params?.[0];
      const entry = mockBlacklist.find(b => b.id === id);
      if (entry) {
        const originalData = { ...entry };
        entry.is_active = false;
        logOperation('blacklist', 'update', entry, originalData);
      }
      return [{ success: true }];
    }
    
    // 模拟操作日志插入
    if (sql.includes('INSERT INTO operation_logs')) {
      console.log('[Mock DB] Operation log inserted');
      return [{ id: 1 }];
    }
    
    return [];
  }
};

// 检查是否应该使用模拟数据库
let forceMockDb: boolean | null = null;

// 上次同步时间
let lastSyncTime: Date | null = null;

export function setForceMockDb(value: boolean) {
  forceMockDb = value;
}

export function shouldUseMockDb(): boolean {
  if (forceMockDb !== null) {
    return forceMockDb;
  }
  return process.env.USE_MOCK_DB === 'true' || !process.env.DATABASE_URL;
}

// 设置上次同步时间
export function setLastSyncTime(time: Date) {
  lastSyncTime = time;
}

// 获取上次同步时间
export function getLastSyncTime(): Date | null {
  return lastSyncTime;
}
