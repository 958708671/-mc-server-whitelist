// 安全处理：检查是否在构建模式
const isBuildMode = process.env.BUILD_MODE === 'production';

// 在构建模式或没有DATABASE_URL时使用模拟对象
let sql: any = {
  query: async function() { return []; },
  __esModule: true,
  default: {
    query: async function() { return []; }
  },
  // 支持模板字符串语法
  [Symbol.for('neon.query')]: async function() { return []; },
  // 支持直接调用
  async apply(_: any, args: any[]) {
    return [];
  },
  // 支持直接调用
  async (...args: any[]) {
    return [];
  }
};

// 仅在非构建模式下尝试初始化实际的neon连接
if (!isBuildMode) {
  try {
    // 尝试导入neon模块
    const { neon } = require('@neondatabase/serverless');
    
    // 检查是否有DATABASE_URL环境变量
    const hasDatabaseUrl = !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '';
    
    if (hasDatabaseUrl) {
      // 有数据库连接时使用实际的neon连接
      sql = neon(process.env.DATABASE_URL, {
        fetchOptions: {
          timeout: 10000
        }
      });
    }
  } catch (error) {
    // 导入或初始化失败时保持使用模拟对象
    console.warn('Neon模块初始化失败，使用模拟对象:', error);
  }
}

// 导出一个安全的数据库查询函数，在没有连接时返回模拟数据
export const safeQuery = async (query: string, params: any[] = []) => {
  try {
    // 尝试执行实际查询
    return await pgPool.query(query, params);
  } catch (error) {
    console.warn('数据库查询失败，返回模拟数据:', error);
    // 返回模拟数据
    return { rows: [] };
  }
};

// 兼容 pg 风格的 query(text, params) 接口，内部用 neon 实现
export const pgPool = {
  query: async (text: string, params: any[] = []) => {
    try {
      if (isBuildMode) {
        // 构建模式时返回模拟数据
        return { rows: [] };
      }
      
      if (!params || params.length === 0) {
        const rows = await sql.query(text);
        return { rows };
      }
      const parts = text.split(/\$(\d+)/g);
      const strings: string[] = [];
      const values: any[] = [];
      for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
          strings.push(parts[i]);
        } else {
          const idx = parseInt(parts[i]) - 1;
          values.push(params[idx]);
        }
      }
      const templateStrings = Object.assign(strings, { raw: strings }) as TemplateStringsArray;
      const rows = await sql(templateStrings, ...values);
      return { rows };
    } catch (error) {
      console.warn('数据库查询失败，返回模拟数据:', error);
      // 返回模拟数据
      return { rows: [] };
    }
  }
};

export async function withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 500): Promise<T> {
  try {
    if (isBuildMode) {
      // 构建模式时返回模拟数据
      return {} as T;
    }
    
    let lastError: Error | undefined;

    for (let attempt = retries; attempt >= 0; attempt--) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        if (attempt === 0) break;
        console.log(`数据库请求失败，${attempt}次重试剩余，${delay}ms后重试...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }

    throw lastError;
  } catch (error) {
    console.warn('withRetry失败，返回模拟数据:', error);
    return {} as T;
  }
}

export async function getNextSortOrder(table: 'announcements' | 'events'): Promise<number> {
  try {
    if (isBuildMode) {
      // 构建模式时返回默认值
      return 1;
    }
    
    // 直接使用模板字符串，确保表名是安全的
    const result = await sql`SELECT COALESCE(MAX(sort_order), 0) as max_order FROM ${table}`;
    return (result[0].max_order || 0) + 1;
  } catch (error) {
    console.warn('getNextSortOrder失败，返回默认值:', error);
    return 1;
  }
}

export default sql;
