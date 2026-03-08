import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '');

export async function GET() {
  try {
    const settings = await sql`
      SELECT setting_key, setting_value, description FROM system_settings
    `;
    
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.setting_key] = s.setting_value;
    });
    
    return NextResponse.json({
      success: true,
      data: settingsMap
    });
  } catch (error) {
    console.error('获取系统设置失败:', error);
    return NextResponse.json(
      { success: false, message: '获取系统设置失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    for (const [key, value] of Object.entries(data)) {
      await sql`
        INSERT INTO system_settings (setting_key, setting_value, updated_at)
        VALUES (${key}, ${String(value)}, NOW())
        ON CONFLICT (setting_key) 
        DO UPDATE SET setting_value = ${String(value)}, updated_at = NOW()
      `;
    }
    
    return NextResponse.json({
      success: true,
      message: '设置保存成功'
    });
  } catch (error) {
    console.error('保存系统设置失败:', error);
    return NextResponse.json(
      { success: false, message: '保存系统设置失败' },
      { status: 500 }
    );
  }
}
