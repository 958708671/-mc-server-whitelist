import { NextRequest, NextResponse } from 'next/server';
import sql, { withRetry } from '@/lib/db';
import { mockApplications, shouldUseMockDb, setForceMockDb } from '@/lib/mock-db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const useMockDb = shouldUseMockDb();
    
    let whitelist;
    if (useMockDb) {
      whitelist = mockApplications
        .filter(a => a.status === 'approved')
        .sort((a, b) => new Date(b.reviewed_at || b.created_at).getTime() - new Date(a.reviewed_at || a.created_at).getTime());
      
      if (search) {
        whitelist = whitelist.filter(a => a.minecraft_id.toLowerCase().includes(search.toLowerCase()));
      }
    } else {
      try {
        if (search) {
          whitelist = await withRetry(async () => {
            return await sql`
              SELECT id, minecraft_id, age, contact, reviewed_by, reviewed_at, created_at
              FROM whitelist_applications 
              WHERE status = 'approved' AND minecraft_id ILIKE ${'%' + search + '%'}
              ORDER BY reviewed_at DESC
            `;
          });
        } else {
          whitelist = await withRetry(async () => {
            return await sql`
              SELECT id, minecraft_id, age, contact, reviewed_by, reviewed_at, created_at
              FROM whitelist_applications 
              WHERE status = 'approved'
              ORDER BY reviewed_at DESC
            `;
          });
        }
      } catch (dbError: any) {
        console.error('数据库查询失败，切换到模拟数据库:', dbError.message);
        setForceMockDb(true);
        whitelist = mockApplications
          .filter(a => a.status === 'approved')
          .sort((a, b) => new Date(b.reviewed_at || b.created_at).getTime() - new Date(a.reviewed_at || a.created_at).getTime());
        
        if (search) {
          whitelist = whitelist.filter(a => a.minecraft_id.toLowerCase().includes(search.toLowerCase()));
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      data: whitelist
    });
  } catch (error) {
    console.error('获取白名单列表失败:', error);
    return NextResponse.json(
      { success: false, message: '获取白名单列表失败' },
      { status: 500 }
    );
  }
}
