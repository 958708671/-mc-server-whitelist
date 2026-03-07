import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '');

// 更新投诉状态
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, adminId, adminName } = await request.json();
    
    // 验证状态值
    const validStatuses = ['pending', 'processing', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: '无效的状态值' },
        { status: 400 }
      );
    }
    
    await sql`
      UPDATE complaints 
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}
    `;
    
    // 记录操作日志
    if (adminId) {
      try {
        await sql`
          INSERT INTO admin_logs (admin_id, action, details, complaint_id, created_at)
          VALUES (${adminId}, 'update_status', ${`管理员 ${adminName || ''} 将投诉状态更新为 ${status}`}, ${id}, NOW())
        `;
      } catch (logError) {
        console.error('记录操作日志失败:', logError);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '状态更新成功' 
    });

  } catch (error) {
    console.error('更新投诉状态失败:', error);
    return NextResponse.json(
      { success: false, message: '更新失败' },
      { status: 500 }
    );
  }
}

// 删除投诉
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const adminName = searchParams.get('adminName');
    
    await sql`DELETE FROM complaints WHERE id = ${id}`;
    
    // 记录操作日志
    if (adminId) {
      try {
        await sql`
          INSERT INTO admin_logs (admin_id, action, details, complaint_id, created_at)
          VALUES (${parseInt(adminId)}, 'delete', ${`管理员 ${adminName || ''} 删除了投诉 #${id}`}, ${id}, NOW())
        `;
      } catch (logError) {
        console.error('记录操作日志失败:', logError);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '删除成功' 
    });

  } catch (error) {
    console.error('删除投诉失败:', error);
    return NextResponse.json(
      { success: false, message: '删除失败' },
      { status: 500 }
    );
  }
}
