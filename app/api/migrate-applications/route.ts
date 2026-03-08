import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '');

export async function GET() {
  try {
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'whitelist_applications'
      );
    `;
    
    if (!tableExists[0].exists) {
      await sql`
        CREATE TABLE whitelist_applications (
          id SERIAL PRIMARY KEY,
          minecraft_id TEXT NOT NULL,
          age INTEGER,
          contact TEXT NOT NULL,
          reason TEXT,
          status TEXT DEFAULT 'pending',
          reviewed_by TEXT,
          reviewed_by_id INTEGER,
          review_note TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          reviewed_at TIMESTAMP
        )
      `;
      return NextResponse.json({ 
        success: true, 
        message: 'whitelist_applications 表创建成功' 
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'whitelist_applications 表已存在' 
    });
  } catch (error) {
    console.error('数据库迁移失败:', error);
    return NextResponse.json(
      { success: false, message: '数据库迁移失败', error: String(error) },
      { status: 500 }
    );
  }
}
