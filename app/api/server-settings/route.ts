import { NextRequest, NextResponse } from 'next/server';
import sql, { withRetry } from '@/lib/db';

let serverSettings: Record<string, string> = {
  qq_group: '',
  client_download_url: '',
  rcon_host: '',
  rcon_port: '25575',
  rcon_password: '',
  server_ip: '',
  server_version: '1.18.2'
};

export async function GET() {
  try {
    let settings = { ...serverSettings };
    let useMockDb = true;
    
    try {
      const result = await withRetry(async () => {
        return await sql`
          SELECT setting_key, setting_value FROM server_settings
        `;
      });
      
      result.forEach((s: any) => {
        settings[s.setting_key] = s.setting_value || '';
      });
      useMockDb = false;
    } catch (dbError) {
      console.log('真实数据库连接失败，使用模拟数据库');
    }
    
    return NextResponse.json({
      success: true,
      data: settings,
      mockMode: useMockDb
    });
  } catch (error) {
    console.error('获取服务器设置失败:', error);
    return NextResponse.json(
      { success: false, message: '获取服务器设置失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { settings } = data;
    
    if (!settings) {
      return NextResponse.json(
        { success: false, message: '缺少设置数据' },
        { status: 400 }
      );
    }
    
    let useMockDb = true;
    
    try {
      for (const [key, value] of Object.entries(settings)) {
        await withRetry(async () => {
          return await sql`
            INSERT INTO server_settings (setting_key, setting_value, updated_at)
            VALUES (${key}, ${value as string}, NOW())
            ON CONFLICT (setting_key) 
            DO UPDATE SET setting_value = ${value as string}, updated_at = NOW()
          `;
        });
      }
      useMockDb = false;
    } catch (dbError) {
      console.log('真实数据库连接失败，使用模拟数据库');
      
      for (const [key, value] of Object.entries(settings)) {
        serverSettings[key] = value as string;
      }
    }
    
    if (useMockDb) {
      for (const [key, value] of Object.entries(settings)) {
        serverSettings[key] = value as string;
      }
    }
    
    console.log('服务器设置已保存:', settings);
    
    return NextResponse.json({
      success: true,
      message: '服务器设置已保存',
      mockMode: useMockDb,
      savedSettings: serverSettings
    });
  } catch (error) {
    console.error('保存服务器设置失败:', error);
    return NextResponse.json(
      { success: false, message: '保存服务器设置失败' },
      { status: 500 }
    );
  }
}
