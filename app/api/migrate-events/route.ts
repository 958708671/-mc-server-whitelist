import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '');

export async function GET() {
  try {
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'events'
      );
    `;
    
    if (!tableExists[0].exists) {
      await sql`
        CREATE TABLE events (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          content TEXT,
          image_url TEXT,
          start_time TIMESTAMP,
          end_time TIMESTAMP,
          status TEXT DEFAULT 'upcoming',
          created_by TEXT,
          created_by_id INTEGER,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP
        )
      `;
      return NextResponse.json({ 
        success: true, 
        message: 'events 表创建成功' 
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'events 表已存在' 
    });
  } catch (error) {
    console.error('数据库迁移失败:', error);
    return NextResponse.json(
      { success: false, message: '数据库迁移失败', error: String(error) },
      { status: 500 }
    );
  }
}
