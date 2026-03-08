import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '');

export async function POST(request: NextRequest) {
  try {
    // 检查是否已经存在管理员
    const existingAdmins = await sql`SELECT COUNT(*) as count FROM admins`;
    
    if (existingAdmins[0]?.count > 0) {
      return NextResponse.json({
        success: false,
        message: '管理员数据已存在，无需恢复',
        count: existingAdmins[0].count
      });
    }

    // 插入服主账号
    await sql`
      INSERT INTO admins (username, password, qq, display_name, is_owner, permissions, show_in_contact, show_in_logs) 
      VALUES (
        '958708671', 
        '95870867120260308', 
        '958708671', 
        '服主', 
        TRUE, 
        '{
          "whitelist_review": true,
          "complaint_handle": true,
          "blacklist_manage": true,
          "announcement_manage": true,
          "event_manage": true,
          "statistics_view": true,
          "settings_view": true,
          "website_edit": true,
          "admin_manage": true,
          "logs_view": true,
          "monitor_view": true
        }'::jsonb, 
        TRUE, 
        TRUE
      )
    `;

    // 插入管理员账号
    await sql`
      INSERT INTO admins (username, password, qq, display_name, is_owner, permissions, show_in_contact, show_in_logs) 
      VALUES (
        '2801699303', 
        '280169930320260308', 
        '2801699303', 
        'fly_yu', 
        FALSE, 
        '{
          "whitelist_review": true,
          "complaint_handle": true,
          "blacklist_manage": true,
          "announcement_manage": true,
          "event_manage": true,
          "statistics_view": true,
          "settings_view": false,
          "website_edit": false,
          "admin_manage": false,
          "logs_view": false,
          "monitor_view": false
        }'::jsonb, 
        TRUE, 
        TRUE
      )
    `;

    await sql`
      INSERT INTO admins (username, password, qq, display_name, is_owner, permissions, show_in_contact, show_in_logs) 
      VALUES (
        '345258083', 
        '34525808320260308', 
        '345258083', 
        'fuyou', 
        FALSE, 
        '{
          "whitelist_review": true,
          "complaint_handle": true,
          "blacklist_manage": true,
          "announcement_manage": true,
          "event_manage": true,
          "statistics_view": true,
          "settings_view": false,
          "website_edit": false,
          "admin_manage": false,
          "logs_view": false,
          "monitor_view": false
        }'::jsonb, 
        TRUE, 
        TRUE
      )
    `;

    await sql`
      INSERT INTO admins (username, password, qq, display_name, is_owner, permissions, show_in_contact, show_in_logs) 
      VALUES (
        '939588079', 
        '93958807920260308', 
        '939588079', 
        '豌豆', 
        FALSE, 
        '{
          "whitelist_review": true,
          "complaint_handle": true,
          "blacklist_manage": true,
          "announcement_manage": true,
          "event_manage": true,
          "statistics_view": true,
          "settings_view": false,
          "website_edit": false,
          "admin_manage": false,
          "logs_view": false,
          "monitor_view": false
        }'::jsonb, 
        TRUE, 
        TRUE
      )
    `;

    return NextResponse.json({
      success: true,
      message: '管理员数据恢复成功',
      restored: 4
    });

  } catch (error) {
    console.error('恢复管理员数据失败:', error);
    return NextResponse.json(
      { success: false, message: '恢复管理员数据失败: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
