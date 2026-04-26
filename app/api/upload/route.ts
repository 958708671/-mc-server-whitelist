import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (files.length === 0) {
      return NextResponse.json(
        { success: false, message: '没有上传文件' },
        { status: 400 }
      );
    }
    
    if (files.length > 10) {
      return NextResponse.json(
        { success: false, message: '最多上传10张图片' },
        { status: 400 }
      );
    }
    
    // 确保上传目录存在
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        continue;
      }
      
      // 生成唯一文件名
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const filePath = join(uploadDir, fileName);
      
      // 写入文件
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);
      
      // 生成URL
      uploadedUrls.push(`/uploads/${fileName}`);
    }
    
    return NextResponse.json({
      success: true,
      urls: uploadedUrls
    });
  } catch (error) {
    console.error('文件上传失败:', error);
    return NextResponse.json(
      { success: false, message: '文件上传失败' },
      { status: 500 }
    );
  }
}
