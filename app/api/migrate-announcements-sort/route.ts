import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '');

export async function GET() {
  try {
    // 检查sort_order字段是否存在
    const columnExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'announcements'
        AND column_name = 'sort_order'
      );
    `;
    
    if (!columnExists[0].exists) {
      // 添加sort_order字段
      await sql`
        ALTER TABLE announcements ADD COLUMN sort_order INTEGER DEFAULT 0
      `;
      
      // 为现有数据设置默认排序值
      await sql`
        UPDATE announcements SET sort_order = id
      `;
      
      return NextResponse.json({ 
        success: true, 
        message: '添加sort_order字段成功' 
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'sort_order字段已存在' 
    });
  } catch (error) {
    console.error('数据库迁移失败:', error);
    return NextResponse.json(
      { success: false, message: '数据库迁移失败', error: String(error) },
      { status: 500 }
    );
  }
}
