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
    const { status } = await request.json();
    
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
    
    await sql`DELETE FROM complaints WHERE id = ${id}`;
    
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
