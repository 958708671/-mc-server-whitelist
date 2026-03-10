import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { host, port, password, playerName } = await request.json();
    
    if (!host || !password || !playerName) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      );
    }
    
    const scriptPath = path.join(process.cwd(), 'scripts', 'rcon-cli.js');
    const command = `whitelist add ${playerName}`;
    
    const result = await new Promise<{ success: boolean; message: string }>((resolve) => {
      exec(
        `node "${scriptPath}" "${host}" "${port || 25575}" "${password}" "${command}"`,
        { timeout: 10000 },
        (error, stdout, stderr) => {
          if (error) {
            resolve({ success: false, message: `执行失败: ${error.message}` });
            return;
          }
          
          try {
            const output = JSON.parse(stdout.trim());
            resolve(output);
          } catch {
            resolve({ success: false, message: `解析输出失败: ${stdout}` });
          }
        }
      );
    });
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('添加白名单失败:', error);
    return NextResponse.json({
      success: false,
      message: error.message || '添加失败'
    });
  }
}
