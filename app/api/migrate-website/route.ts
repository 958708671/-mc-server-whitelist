import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '');

export async function GET() {
  try {
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'website_config'
      );
    `;
    
    if (!tableExists[0].exists) {
      await sql`
        CREATE TABLE website_config (
          id INTEGER PRIMARY KEY,
          server_name TEXT,
          server_description TEXT,
          server_version TEXT,
          welcome_message TEXT,
          contact_qq TEXT,
          contact_qqid TEXT,
          announcement TEXT,
          elements JSONB,
          rules JSONB,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;
      return NextResponse.json({ 
        success: true, 
        message: 'website_config 表创建成功' 
      });
    }
    
    await sql`
      ALTER TABLE website_config 
      ADD COLUMN IF NOT EXISTS elements JSONB
    `;
    
    await sql`
      ALTER TABLE website_config 
      ADD COLUMN IF NOT EXISTS rules JSONB
    `;
    
    return NextResponse.json({ 
      success: true, 
      message: 'website_config 表更新成功' 
    });
  } catch (error) {
    console.error('数据库迁移失败:', error);
    return NextResponse.json(
      { success: false, message: '数据库迁移失败', error: String(error) },
      { status: 500 }
    );
  }
}
