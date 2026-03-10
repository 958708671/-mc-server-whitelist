#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');

// 数据库连接字符串
const databaseUrl = 'postgresql://neondb_owner:npg_Rs4dK7gknbSY@ep-autumn-frog-a15r2a2l-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

// 连接数据库
const sql = neon(databaseUrl, {
  fetchOptions: {
    timeout: 60000,
  }
});

async function testConnection() {
  console.log('测试数据库连接...');
  
  try {
    // 测试简单查询
    const result = await sql`SELECT 1 as test`;
    console.log('✅ 数据库连接成功！');
    console.log('测试结果:', result);
    
    // 测试添加列
    console.log('\n测试添加列...');
    await sql`ALTER TABLE blacklist ADD COLUMN IF NOT EXISTS ip_address VARCHAR(50)`;
    console.log('✅ 成功添加 ip_address 列');
    
  } catch (error) {
    console.error('❌ 数据库操作失败:', error.message);
  } finally {
    console.log('\n测试完成');
  }
}

testConnection();
