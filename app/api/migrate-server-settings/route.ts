import { NextResponse } from 'next/server';
import sql, { withRetry } from '@/lib/db';

export async function GET() {
  try {
    await withRetry(async () => {
      return await sql`
        CREATE TABLE IF NOT EXISTS server_settings (
          id SERIAL PRIMARY KEY,
          setting_key VARCHAR(100) UNIQUE NOT NULL,
          setting_value TEXT,
          description VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
    });
    
    await withRetry(async () => {
      return await sql`
        INSERT INTO server_settings (setting_key, setting_value, description)
        VALUES 
          ('qq_group', '', 'QQ群号'),
          ('client_download_url', '', '客户端下载地址'),
          ('rcon_host', '', 'Minecraft服务器RCON地址'),
          ('rcon_port', '25575', 'RCON端口'),
          ('rcon_password', '', 'RCON密码'),
          ('server_ip', '', '服务器IP地址'),
          ('server_version', '1.20.4', '服务器版本')
        ON CONFLICT (setting_key) DO NOTHING
      `;
    });
    
    return NextResponse.json({ 
      success: true, 
      message: '服务器设置表创建成功'
    });
  } catch (error) {
    console.error('创建服务器设置表失败:', error);
    return NextResponse.json(
      { success: false, message: '创建失败', error: String(error) },
      { status: 500 }
    );
  }
}
