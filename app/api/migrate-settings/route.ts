import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '');

export async function GET() {
  try {
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'system_settings'
      );
    `;
    
    if (!tableExists[0].exists) {
      await sql`
        CREATE TABLE system_settings (
          id SERIAL PRIMARY KEY,
          setting_key TEXT UNIQUE NOT NULL,
          setting_value TEXT,
          description TEXT,
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;
      
      await sql`
        INSERT INTO system_settings (setting_key, setting_value, description) VALUES
        ('server_name', '星光之境', '服务器名称'),
        ('server_description', '一个纯净的Minecraft生存服务器', '服务器描述'),
        ('contact_qq', '', '联系QQ'),
        ('contact_email', '', '联系邮箱'),
        ('whitelist_enabled', 'true', '是否开启白名单'),
        ('registration_enabled', 'true', '是否开放申请'),
        ('maintenance_mode', 'false', '维护模式')
      `;
      
      return NextResponse.json({ 
        success: true, 
        message: 'system_settings 表创建成功' 
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'system_settings 表已存在' 
    });
  } catch (error) {
    console.error('数据库迁移失败:', error);
    return NextResponse.json(
      { success: false, message: '数据库迁移失败', error: String(error) },
      { status: 500 }
    );
  }
}
