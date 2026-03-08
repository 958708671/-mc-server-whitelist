import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '');

export async function GET() {
  try {
    await sql`
      ALTER TABLE complaints 
      ADD COLUMN IF NOT EXISTS handler TEXT
    `;
    
    await sql`
      ALTER TABLE complaints 
      ADD COLUMN IF NOT EXISTS handler_id INTEGER
    `;
    
    await sql`
      ALTER TABLE complaints 
      ADD COLUMN IF NOT EXISTS resolution_note TEXT
    `;
    
    await sql`
      ALTER TABLE complaints 
      ADD COLUMN IF NOT EXISTS resolution_images TEXT
    `;
    
    await sql`
      ALTER TABLE complaints 
      ADD COLUMN IF NOT EXISTS investigation_note TEXT
    `;
    
    return NextResponse.json({ 
      success: true, 
      message: '数据库字段添加成功' 
    });
  } catch (error) {
    console.error('数据库迁移失败:', error);
    return NextResponse.json(
      { success: false, message: '数据库迁移失败', error: String(error) },
      { status: 500 }
    );
  }
}
