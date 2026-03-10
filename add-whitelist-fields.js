const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL || 'postgresql://neondb_owner:cloudtops2024@ep-autumn-frog-a15r2a2l-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function addWhitelistFields() {
  try {
    console.log('正在添加白名单申请相关字段...');
    
    // 游戏经验相关字段
    await sql`
      ALTER TABLE whitelist_applications
      ADD COLUMN IF NOT EXISTS play_time integer DEFAULT 0
    `;
    console.log('✓ 添加 play_time 字段成功');
    
    await sql`
      ALTER TABLE whitelist_applications
      ADD COLUMN IF NOT EXISTS favorite_mode text DEFAULT ''
    `;
    console.log('✓ 添加 favorite_mode 字段成功');
    
    await sql`
      ALTER TABLE whitelist_applications
      ADD COLUMN IF NOT EXISTS server_experience text DEFAULT ''
    `;
    console.log('✓ 添加 server_experience 字段成功');
    
    // 个人信息相关字段
    await sql`
      ALTER TABLE whitelist_applications
      ADD COLUMN IF NOT EXISTS gender text DEFAULT ''
    `;
    console.log('✓ 添加 gender 字段成功');
    
    await sql`
      ALTER TABLE whitelist_applications
      ADD COLUMN IF NOT EXISTS country text DEFAULT ''
    `;
    console.log('✓ 添加 country 字段成功');
    
    // 社区相关字段
    await sql`
      ALTER TABLE whitelist_applications
      ADD COLUMN IF NOT EXISTS how_found text DEFAULT ''
    `;
    console.log('✓ 添加 how_found 字段成功');
    
    await sql`
      ALTER TABLE whitelist_applications
      ADD COLUMN IF NOT EXISTS discord_id text DEFAULT ''
    `;
    console.log('✓ 添加 discord_id 字段成功');
    
    // 游戏行为相关字段
    await sql`
      ALTER TABLE whitelist_applications
      ADD COLUMN IF NOT EXISTS play_style text DEFAULT ''
    `;
    console.log('✓ 添加 play_style 字段成功');
    
    await sql`
      ALTER TABLE whitelist_applications
      ADD COLUMN IF NOT EXISTS griefing_history text DEFAULT ''
    `;
    console.log('✓ 添加 griefing_history 字段成功');
    
    // 其他字段
    await sql`
      ALTER TABLE whitelist_applications
      ADD COLUMN IF NOT EXISTS additional_info text DEFAULT ''
    `;
    console.log('✓ 添加 additional_info 字段成功');
    
    console.log('\n所有字段添加成功！');
    
    // 验证字段是否添加成功
    console.log('\n验证字段添加结果:');
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'whitelist_applications'
      AND column_name IN ('play_time', 'favorite_mode', 'server_experience', 'gender', 'country', 'how_found', 'discord_id', 'play_style', 'griefing_history', 'additional_info')
      ORDER BY ordinal_position
    `;
    
    columns.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type}`);
    });
    
  } catch (error) {
    console.error('添加字段失败:', error);
  } finally {
    process.exit();
  }
}

addWhitelistFields();