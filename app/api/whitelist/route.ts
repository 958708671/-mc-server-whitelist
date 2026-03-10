import { NextRequest, NextResponse } from 'next/server';
import sql, { withRetry } from '@/lib/db';
import { mockApplications, mockAdmins, shouldUseMockDb, setForceMockDb, isAdminDeleted, addDeletedAdminId } from '@/lib/mock-db';

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
      
      // 添加管理员和辅助账号到白名单列表
      const adminAccounts = mockAdmins
        .filter(admin => !isAdminDeleted(admin.id))
        .map(admin => ({
          id: -admin.id, // 使用负数ID避免冲突
          minecraft_id: admin.username,
          age: 18,
          contact: `QQ: ${admin.qq}`,
          reviewed_by: '系统',
          reviewed_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }));
      
      whitelist = [...adminAccounts, ...whitelist];
      
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
        
        // 添加管理员和辅助账号到白名单列表
        const adminAccounts = mockAdmins
          .filter(admin => !isAdminDeleted(admin.id))
          .map(admin => ({
            id: -admin.id, // 使用负数ID避免冲突
            minecraft_id: admin.username,
            age: 18,
            contact: `QQ: ${admin.qq}`,
            reviewed_by: '系统',
            reviewed_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          }));
        
        whitelist = [...adminAccounts, ...whitelist];
      } catch (dbError: any) {
        console.error('数据库查询失败，切换到模拟数据库:', dbError.message);
        setForceMockDb(true);
        whitelist = mockApplications
          .filter(a => a.status === 'approved')
          .sort((a, b) => new Date(b.reviewed_at || b.created_at).getTime() - new Date(a.reviewed_at || a.created_at).getTime());
        
        // 添加管理员和辅助账号到白名单列表
        const adminAccounts = mockAdmins
          .filter(admin => !isAdminDeleted(admin.id))
          .map(admin => ({
            id: -admin.id, // 使用负数ID避免冲突
            minecraft_id: admin.username,
            age: 18,
            contact: `QQ: ${admin.qq}`,
            reviewed_by: '系统',
            reviewed_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          }));
        
        whitelist = [...adminAccounts, ...whitelist];
        
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: '缺少用户ID' },
        { status: 400 }
      );
    }
    
    const userId = parseInt(id);
    const useMockDb = shouldUseMockDb();
    
    // 处理管理员账号（ID为负数）
    if (userId < 0) {
      // 管理员账号从白名单中移除，但不修改其状态
      // 因为管理员账号是虚拟添加到白名单列表的，不是真实的申请
      // 将管理员ID添加到被删除列表中，以便持久化过滤
      const adminId = Math.abs(userId);
      addDeletedAdminId(adminId);
      return NextResponse.json({
        success: true,
        message: '白名单删除成功'
      });
    }
    
    if (useMockDb) {
      // 处理模拟数据库
      const index = mockApplications.findIndex(a => a.id === userId && a.status === 'approved');
      if (index !== -1) {
        mockApplications[index].status = 'pending';
      }
    } else {
      try {
        // 处理真实数据库
        await withRetry(async () => {
          await sql`
            UPDATE whitelist_applications 
            SET status = 'pending' 
            WHERE id = ${userId} AND status = 'approved'
          `;
        });
      } catch (dbError: any) {
        console.error('数据库删除失败，切换到模拟数据库:', dbError.message);
        setForceMockDb(true);
        const index = mockApplications.findIndex(a => a.id === userId && a.status === 'approved');
        if (index !== -1) {
          mockApplications[index].status = 'pending';
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: '白名单删除成功'
    });
  } catch (error) {
    console.error('删除白名单失败:', error);
    return NextResponse.json(
      { success: false, message: '删除白名单失败' },
      { status: 500 }
    );
  }
}
