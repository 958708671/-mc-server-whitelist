import { NextRequest, NextResponse } from 'next/server';
import sql, { withRetry } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    let whitelist;
    
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
    
    // 查询管理员列表
    const admins = await withRetry(async () => {
      return await sql`
        SELECT id, username, qq FROM admins
        WHERE is_owner = TRUE OR id > 0
      `;
    });
    
    // 添加管理员账号到白名单列表
    const adminAccounts = admins.map(admin => ({
      id: -admin.id, // 使用负数ID避免冲突
      minecraft_id: admin.username,
      age: 18,
      contact: `QQ: ${admin.qq}`,
      reviewed_by: '系统',
      reviewed_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }));
    
    whitelist = [...adminAccounts, ...whitelist];
    
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
    
    // 处理管理员账号（ID为负数）
    if (userId < 0) {
      // 管理员账号从白名单中移除，但不修改其状态
      // 因为管理员账号是虚拟添加到白名单列表的，不是真实的申请
      return NextResponse.json({
        success: true,
        message: '白名单删除成功'
      });
    }
    
    // 处理真实数据库
    await withRetry(async () => {
      await sql`
        UPDATE whitelist_applications 
        SET status = 'pending' 
        WHERE id = ${userId} AND status = 'approved'
      `;
    });
    
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
