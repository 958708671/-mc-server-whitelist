import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '');

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const result = await sql`
      SELECT minecraft_id FROM blacklist WHERE id = ${parseInt(id)}
    `;
    
    if (result.length > 0) {
      const minecraft_id = result[0].minecraft_id;
      
      await sql`
        DELETE FROM blacklist WHERE id = ${parseInt(id)}
      `;
      
      await sql`
        UPDATE whitelist_applications 
        SET status = 'approved'
        WHERE minecraft_id = ${minecraft_id}
      `;
    }
    
    return NextResponse.json({
      success: true,
      message: '已从黑名单移除'
    });
  } catch (error) {
    console.error('移除黑名单失败:', error);
    return NextResponse.json(
      { success: false, message: '移除黑名单失败' },
      { status: 500 }
    );
  }
}
