import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '');

export async function GET(request: NextRequest) {
  try {
    const admins = await sql`
      SELECT id, username, display_name, qq, is_owner, permissions, show_in_contact, show_in_logs, created_at
      FROM admins
      ORDER BY is_owner DESC, id ASC
    `;
    
    // 解析 permissions JSONB 字段
    const formattedAdmins = admins.map(admin => ({
      ...admin,
      permissions: admin.permissions || {
        whitelist_review: true,
        complaint_handle: true,
        blacklist_manage: true,
        announcement_manage: true,
        event_manage: true,
        statistics_view: true,
        settings_view: false,
        website_edit: false,
        admin_manage: false,
        logs_view: false,
        monitor_view: false
      },
      show_in_contact: admin.show_in_contact !== false,
      show_in_logs: admin.show_in_logs !== false
    }));
    
    return NextResponse.json({
      success: true,
      data: formattedAdmins
    });
    
  } catch (error) {
    console.error('获取管理员列表失败:', error);
    return NextResponse.json(
      { success: false, message: '获取管理员列表失败' },
      { status: 500 }
    );
  }
}
