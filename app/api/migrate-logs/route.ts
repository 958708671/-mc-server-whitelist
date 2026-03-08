import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '');

export async function GET() {
  try {
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'operation_logs'
      );
    `;
    
    if (!tableExists[0].exists) {
      await sql`
        CREATE TABLE operation_logs (
          id SERIAL PRIMARY KEY,
          admin_id INTEGER,
          admin_name TEXT,
          action TEXT NOT NULL,
          target_type TEXT,
          target_id INTEGER,
          details TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;
      return NextResponse.json({ 
        success: true, 
        message: 'operation_logs 表创建成功' 
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'operation_logs 表已存在' 
    });
  } catch (error) {
    console.error('数据库迁移失败:', error);
    return NextResponse.json(
      { success: false, message: '数据库迁移失败', error: String(error) },
      { status: 500 }
    );
  }
}
