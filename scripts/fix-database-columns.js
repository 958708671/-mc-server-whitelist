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

async function addColumn(table, column, type, defaultValue = null) {
  try {
    let sqlQuery;
    if (defaultValue !== null) {
      sqlQuery = `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column} ${type} DEFAULT ${defaultValue}`;
    } else {
      sqlQuery = `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column} ${type}`;
    }
    
    await sql`${sqlQuery}`;
    console.log(`✅ 成功添加 ${table}.${column} 列`);
  } catch (error) {
    console.error(`❌ 添加 ${table}.${column} 列失败:`, error.message);
  }
}

async function createIndex(table, indexName, columns) {
  try {
    const sqlQuery = `CREATE INDEX IF NOT EXISTS ${indexName} ON ${table}(${columns})`;
    await sql`${sqlQuery}`;
    console.log(`✅ 成功创建索引 ${indexName} 于 ${table} 表`);
  } catch (error) {
    console.error(`❌ 创建索引 ${indexName} 失败:`, error.message);
  }
}

async function updateNullValues(table, column, value) {
  try {
    const sqlQuery = `UPDATE ${table} SET ${column} = ${value} WHERE ${column} IS NULL`;
    await sql`${sqlQuery}`;
    console.log(`✅ 成功更新 ${table}.${column} 的 NULL 值`);
  } catch (error) {
    console.error(`❌ 更新 ${table}.${column} 失败:`, error.message);
  }
}

async function fixDatabase() {
  console.log('开始修复数据库表结构...\n');
  
  // 修复 blacklist 表
  console.log('=== 修复 blacklist 表 ===');
  await addColumn('blacklist', 'ip_address', 'VARCHAR(50)');
  await addColumn('blacklist', 'banned_by_id', 'INTEGER');
  await addColumn('blacklist', 'is_permanent', 'BOOLEAN', 'FALSE');
  await addColumn('blacklist', 'duration_minutes', 'INTEGER');
  await addColumn('blacklist', 'expires_at', 'TIMESTAMP');
  await addColumn('blacklist', 'is_active', 'BOOLEAN', 'TRUE');
  await addColumn('blacklist', 'updated_at', 'TIMESTAMP', 'CURRENT_TIMESTAMP');
  
  // 修复 events 表
  console.log('\n=== 修复 events 表 ===');
  await addColumn('events', 'location', 'VARCHAR(200)');
  await addColumn('events', 'max_participants', 'INTEGER');
  await addColumn('events', 'organizer', 'VARCHAR(100)');
  await addColumn('events', 'updated_at', 'TIMESTAMP', 'CURRENT_TIMESTAMP');
  
  // 修复 ip_bans 表
  console.log('\n=== 修复 ip_bans 表 ===');
  await addColumn('ip_bans', 'minecraft_id', 'VARCHAR(100)');
  await addColumn('ip_bans', 'banned_by_id', 'INTEGER');
  await addColumn('ip_bans', 'is_active', 'BOOLEAN', 'TRUE');
  await addColumn('ip_bans', 'unbanned_at', 'TIMESTAMP');
  await addColumn('ip_bans', 'unbanned_by', 'VARCHAR(100)');
  
  // 创建索引
  console.log('\n=== 创建索引 ===');
  await createIndex('blacklist', 'idx_blacklist_minecraft_id', 'minecraft_id');
  await createIndex('blacklist', 'idx_blacklist_ip', 'ip_address');
  await createIndex('blacklist', 'idx_blacklist_is_active', 'is_active');
  await createIndex('blacklist', 'idx_blacklist_expires_at', 'expires_at');
  await createIndex('events', 'idx_events_start_time', 'start_time');
  await createIndex('ip_bans', 'idx_ip_bans_ip', 'ip_address');
  await createIndex('ip_bans', 'idx_ip_bans_minecraft_id', 'minecraft_id');
  await createIndex('ip_bans', 'idx_ip_bans_active', 'is_active');
  
  // 更新 NULL 值
  console.log('\n=== 更新 NULL 值 ===');
  await updateNullValues('blacklist', 'is_active', 'TRUE');
  await updateNullValues('blacklist', 'is_permanent', 'FALSE');
  await updateNullValues('ip_bans', 'is_active', 'TRUE');
  
  console.log('\n🎉 数据库修复完成！');
  console.log('✅ 所有缺失的列已添加');
  console.log('✅ 所有必要的索引已创建');
  console.log('✅ 所有 NULL 值已更新');
  console.log('\n系统现在可以连接到真实数据库了！');
}

fixDatabase();
