const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL || 'postgresql://neondb_owner:cloudtops2024@ep-autumn-frog-a15r2a2l-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function addQuizFields() {
  try {
    console.log('正在添加 quiz 相关字段到 whitelist_applications 表...');
    
    // 添加 quiz_category 字段
    await sql`
      ALTER TABLE whitelist_applications
      ADD COLUMN IF NOT EXISTS quiz_category text DEFAULT ''
    `;
    console.log('✓ 添加 quiz_category 字段成功');
    
    // 添加 quiz_score 字段
    await sql`
      ALTER TABLE whitelist_applications
      ADD COLUMN IF NOT EXISTS quiz_score integer DEFAULT 0
    `;
    console.log('✓ 添加 quiz_score 字段成功');
    
    // 添加 quiz_total 字段
    await sql`
      ALTER TABLE whitelist_applications
      ADD COLUMN IF NOT EXISTS quiz_total integer DEFAULT 0
    `;
    console.log('✓ 添加 quiz_total 字段成功');
    
    console.log('\n所有字段添加成功！');
    
    // 验证字段是否添加成功
    console.log('\n验证字段添加结果:');
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'whitelist_applications'
      AND column_name IN ('quiz_category', 'quiz_score', 'quiz_total')
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

addQuizFields();