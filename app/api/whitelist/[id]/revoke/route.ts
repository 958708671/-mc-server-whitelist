import { NextRequest, NextResponse } from 'next/server';
import sql, { withRetry } from '@/lib/db';
import { exec } from 'child_process';
import path from 'path';
import { Rcon } from 'rcon-client';

// 在Minecraft服务器中解封IP
async function unbanIPInMinecraft(ip: string): Promise<{ success: boolean; message: string }> {
  try {
    const rconHost = process.env.RCON_HOST || '127.0.0.1';
    const rconPort = parseInt(process.env.RCON_PORT || '25575');
    const rconPassword = process.env.RCON_PASSWORD || 'cloudtops2024';

    const rcon = await Rcon.connect({
      host: rconHost,
      port: rconPort,
      password: rconPassword
    });

    // 使用 /pardon-ip 命令解封IP
    const unbanCommand = `pardon-ip ${ip}`;
    const response = await rcon.send(unbanCommand);

    await rcon.end();

    return {
      success: true,
      message: `IP解封成功: ${response}`
    };
  } catch (error) {
    console.error('Minecraft IP解封失败:', error);
    return {
      success: false,
      message: `IP解封失败: ${error instanceof Error ? error.message : '未知错误'}`
    };
  }
}

const rconRemoveFromWhitelist = (
  host: string,
  port: number,
  password: string,
  playerName: string
): Promise<{ success: boolean; message: string }> => {
  return new Promise(async (resolve) => {
    try {
      const scriptPath = path.join(process.cwd(), 'scripts', 'rcon-cli.js');
      
      const removeCommand = `whitelist remove ${playerName}`;
      const removeResult = await new Promise<{ success: boolean; message: string }>((resolveRemove) => {
        exec(
          `node "${scriptPath}" "${host}" "${port}" "${password}" "${removeCommand}"`,
          { timeout: 10000 },
          (error, stdout, stderr) => {
            if (error) {
              resolveRemove({ success: false, message: `执行失败: ${error.message}` });
              return;
            }
            
            try {
              const output = JSON.parse(stdout.trim());
              resolveRemove(output);
            } catch {
              resolveRemove({ success: false, message: `解析输出失败: ${stdout}` });
            }
          }
        );
      });
      
      if (!removeResult.success) {
        resolve(removeResult);
        return;
      }
      
      const reloadCommand = 'whitelist reload';
      const reloadResult = await new Promise<{ success: boolean; message: string }>((resolveReload) => {
        exec(
          `node "${scriptPath}" "${host}" "${port}" "${password}" "${reloadCommand}"`,
          { timeout: 10000 },
          (error, stdout, stderr) => {
            if (error) {
              resolveReload({ success: false, message: `执行失败: ${error.message}` });
              return;
            }
            
            try {
              const output = JSON.parse(stdout.trim());
              resolveReload(output);
            } catch {
              resolveReload({ success: false, message: `解析输出失败: ${stdout}` });
            }
          }
        );
      });
      
      resolve({
        success: true,
        message: `移除成功: ${removeResult.message}, 重载成功: ${reloadResult.message}`
      });
    } catch (error) {
      resolve({ success: false, message: `执行失败: ${error}` });
    }
  });
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    let applicationResult: any[] = [];
    
    // 查询申请信息
    applicationResult = await withRetry(async () => {
      return await sql`
        SELECT minecraft_id, ip_address FROM whitelist_applications WHERE id = ${parseInt(id)}
      `;
    });
    
    if (applicationResult.length === 0) {
      return NextResponse.json(
        { success: false, message: '申请不存在' },
        { status: 404 }
      );
    }
    
    const minecraftId = applicationResult[0].minecraft_id;
    const ipAddress = applicationResult[0].ip_address;
    
    // 检查该玩家是否在黑名单中，如果在则解封IP
    let unbanResult = null;
    if (ipAddress) {
      try {
        const blacklistResult = await withRetry(async () => {
          return await sql`
            SELECT id FROM blacklist WHERE minecraft_id = ${minecraftId}
          `;
        });
        
        if (blacklistResult.length > 0) {
          // 从黑名单移除
          await withRetry(async () => {
            return await sql`
              DELETE FROM blacklist WHERE minecraft_id = ${minecraftId}
            `;
          });
          
          // 更新IP封禁记录为已解封
          await withRetry(async () => {
            return await sql`
              UPDATE ip_bans 
              SET is_active = FALSE, unbanned_at = CURRENT_TIMESTAMP, unbanned_by = '系统撤销'
              WHERE minecraft_id = ${minecraftId} AND is_active = TRUE
            `;
          });
          
          // 在Minecraft服务器中解封IP
          unbanResult = await unbanIPInMinecraft(ipAddress);
        }
      } catch (error) {
        console.error('检查/移除黑名单失败:', error);
      }
    }
    
    // 更新申请状态为待审核
    await withRetry(async () => {
      return await sql`
        UPDATE whitelist_applications 
        SET status = 'pending', 
            reviewed_by = NULL, 
            reviewed_by_id = NULL,
            review_note = NULL,
            reviewed_at = NULL
        WHERE id = ${parseInt(id)}
      `;
    });
    
    let settings: Record<string, string> = {
      rcon_host: '127.0.0.1',
      rcon_port: '25575',
      rcon_password: 'cloudtops2024'
    };
    
    try {
      const settingsResult = await withRetry(async () => {
        return await sql`
          SELECT setting_key, setting_value FROM server_settings
        `;
      });
      
      settingsResult.forEach((s: any) => {
        settings[s.setting_key] = s.setting_value || '';
      });
    } catch (e) {
      console.log('从数据库获取服务器设置失败，使用默认配置:', e);
    }
    
    if (settings.rcon_host && settings.rcon_password) {
      const rconPort = parseInt(settings.rcon_port) || 25575;
      (async () => {
        try {
          await rconRemoveFromWhitelist(
            settings.rcon_host,
            rconPort,
            settings.rcon_password,
            minecraftId
          );
        } catch (error) {
          console.error('从白名单移除失败:', error);
        }
      })();
    }
    
    return NextResponse.json({
      success: true,
      message: '已撤销审核，申请已回到待审核状态',
      unbanResult: unbanResult
    });
    
  } catch (error: any) {
    console.error('撤销审核失败:', error);
    return NextResponse.json(
      { success: false, message: error.message || '撤销失败' },
      { status: 500 }
    );
  }
}
