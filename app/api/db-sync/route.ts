import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { 
  mockApplications, 
  mockServerSettings,
  shouldUseMockDb,
  setForceMockDb
} from '@/lib/mock-db';

export async function POST() {
  try {
    await sql`SELECT 1 as test`;
    
    console.log('[数据同步] 开始同步模拟数据库数据到真实数据库...');
    
    const syncResults = {
      applications: { success: 0, failed: 0 },
      serverSettings: { success: 0, failed: 0 },
      errors: [] as string[]
    };
    
    for (const app of mockApplications) {
      try {
        const existing = await sql`
          SELECT id FROM whitelist_applications WHERE id = ${app.id}
        `;
        
        if (existing.length === 0) {
          await sql`
            INSERT INTO whitelist_applications (
              id, minecraft_id, age, contact, reason, status,
              reviewed_by, reviewed_by_id, review_note,
              created_at, reviewed_at, play_time, favorite_mode,
              server_experience, gender, country, how_found,
              discord_id, play_style, griefing_history, additional_info,
              quiz_category, quiz_score, quiz_total
            ) VALUES (
              ${app.id}, ${app.minecraft_id}, ${app.age}, ${app.contact},
              ${app.reason || ''}, ${app.status},
              ${app.reviewed_by}, ${app.reviewed_by_id}, ${app.review_note},
              ${app.created_at}, ${app.reviewed_at}, ${app.play_time},
              ${app.favorite_mode}, ${app.server_experience}, ${app.gender},
              ${app.country}, ${app.how_found}, ${app.discord_id},
              ${app.play_style}, ${app.griefing_history}, ${app.additional_info},
              ${app.quiz_category}, ${app.quiz_score}, ${app.quiz_total}
            )
          `;
        } else {
          await sql`
            UPDATE whitelist_applications SET
              minecraft_id = ${app.minecraft_id},
              age = ${app.age},
              contact = ${app.contact},
              reason = ${app.reason || ''},
              status = ${app.status},
              reviewed_by = ${app.reviewed_by},
              reviewed_by_id = ${app.reviewed_by_id},
              review_note = ${app.review_note},
              reviewed_at = ${app.reviewed_at},
              play_time = ${app.play_time},
              quiz_category = ${app.quiz_category},
              quiz_score = ${app.quiz_score},
              quiz_total = ${app.quiz_total}
            WHERE id = ${app.id}
          `;
        }
        syncResults.applications.success++;
      } catch (err: any) {
        syncResults.applications.failed++;
        syncResults.errors.push(`申请#${app.id}同步失败: ${err.message}`);
      }
    }
    
    for (const [key, value] of Object.entries(mockServerSettings)) {
      try {
        await sql`
          INSERT INTO server_settings (setting_key, setting_value, updated_at)
          VALUES (${key}, ${value}, NOW())
          ON CONFLICT (setting_key) 
          DO UPDATE SET setting_value = ${value}, updated_at = NOW()
        `;
        syncResults.serverSettings.success++;
      } catch (err: any) {
        syncResults.serverSettings.failed++;
        syncResults.errors.push(`设置${key}同步失败: ${err.message}`);
      }
    }
    
    setForceMockDb(false);
    
    console.log('[数据同步] 同步完成:', syncResults);
    
    return NextResponse.json({
      success: true,
      message: '数据同步完成，模拟数据库已关闭',
      results: syncResults
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: `数据库连接失败，无法同步: ${error.message}`
    });
  }
}
