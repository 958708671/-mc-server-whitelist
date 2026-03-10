#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 导入数据库连接
const { neon } = require('@neondatabase/serverless');

// 读取SQL脚本
const sqlScriptPath = path.join(__dirname, '../database/fix_all_missing_columns_simple.sql');
const sqlScript = fs.readFileSync(sqlScriptPath, 'utf8');

// 数据库连接字符串
const databaseUrl = 'postgresql://neondb_owner:npg_Rs4dK7gknbSY@ep-autumn-frog-a15r2a2l-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

// 连接数据库
const sql = neon(databaseUrl, {
  fetchOptions: {
    timeout: 60000,
  }
});

async function runMigration() {
  console.log('开始执行数据库迁移脚本...');
  
  try {
    // 执行SQL脚本
    await sql`${sqlScript}`;
    console.log('✅ 数据库迁移成功！');
    console.log('✅ 所有缺失的列已添加');
    console.log('✅ 系统现在可以连接到真实数据库了');
  } catch (error) {
    console.error('❌ 数据库迁移失败:', error.message);
    console.error('请检查数据库连接信息是否正确');
    process.exit(1);
  } finally {
    // 关闭连接
    if (sql) {
      // neon 连接会自动关闭，这里不需要额外操作
    }
  }
}

// 运行迁移
runMigration();
