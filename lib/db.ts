import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '', {
  fetchOptions: {
    timeout: 60000,
  }
});

let dbConnectionFailed = false;
let autoSwitchNotified = false;

export async function withRetry<T>(fn: () => Promise<T>, retries = 5, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error?.message || '';
    const isConnectionError = 
      errorMsg.includes('ECONNREFUSED') ||
      errorMsg.includes('ETIMEDOUT') ||
      errorMsg.includes('ENOTFOUND') ||
      errorMsg.includes('connection') ||
      errorMsg.includes('timeout') ||
      errorMsg.includes('does not exist') ||
      errorMsg.includes('不存在') ||
      error?.code === 'ECONNREFUSED' ||
      error?.code === 'ETIMEDOUT';
    
    if (retries === 0 || isConnectionError) {
      if (!dbConnectionFailed) {
        dbConnectionFailed = true;
        console.log('[数据库] 连接/查询失败，自动开启模拟数据库');
        import('./mock-db').then(({ setForceMockDb }) => {
          setForceMockDb(true);
        });
      }
      throw error;
    }
    console.log(`数据库请求失败，${retries}次重试剩余，${delay}ms后重试...`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
}

export function isDbConnectionFailed(): boolean {
  return dbConnectionFailed;
}

export function resetDbConnectionStatus(): void {
  dbConnectionFailed = false;
  autoSwitchNotified = false;
}

export function hasAutoSwitchNotified(): boolean {
  return autoSwitchNotified;
}

export function setAutoSwitchNotified(value: boolean): void {
  autoSwitchNotified = value;
}

export default sql;
