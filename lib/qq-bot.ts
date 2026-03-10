// QQ机器人工具
import sql, { withRetry } from './db';

interface QQBotConfig {
  apiUrl: string; // go-cqhttp HTTP API地址
  adminQqs: string[]; // 管理员QQ号列表
  botQq: string; // 机器人QQ号
}

let qqBotConfig: QQBotConfig | null = null;

// 初始化QQ机器人配置
export const initQqBot = (config: QQBotConfig) => {
  qqBotConfig = config;
  console.log('QQ机器人已初始化:', config);
};

// 发送QQ消息
export const sendQqMessage = async (qq: string, message: string): Promise<boolean> => {
  if (!qqBotConfig) {
    console.log('QQ机器人未配置，跳过发送消息');
    return false;
  }

  try {
    const response = await fetch(`${qqBotConfig.apiUrl}/send_private_msg`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: qq,
        message: message,
      }),
    });

    if (!response.ok) {
      console.error('发送QQ消息失败:', await response.text());
      return false;
    }

    const result = await response.json();
    if (result.status === 'ok') {
      console.log('QQ消息发送成功');
      return true;
    } else {
      console.error('发送QQ消息失败:', result);
      return false;
    }
  } catch (error) {
    console.error('发送QQ消息出错:', error);
    return false;
  }
};

// 发送好友请求
export const sendFriendRequest = async (qq: string, message: string): Promise<boolean> => {
  if (!qqBotConfig) {
    console.log('QQ机器人未配置，跳过发送好友请求');
    return false;
  }

  try {
    const response = await fetch(`${qqBotConfig.apiUrl}/add_friend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: qq,
        comment: message,
      }),
    });

    if (!response.ok) {
      console.error('发送好友请求失败:', await response.text());
      return false;
    }

    const result = await response.json();
    if (result.status === 'ok') {
      console.log('好友请求发送成功');
      return true;
    } else {
      console.error('发送好友请求失败:', result);
      return false;
    }
  } catch (error) {
    console.error('发送好友请求出错:', error);
    return false;
  }
};

// 从数据库获取管理员QQ号
async function getAdminQqs(): Promise<string[]> {
  try {
    // 从真实数据库获取
    const admins = await withRetry(async () => {
      return await sql`
        SELECT qq FROM admins 
        WHERE qq IS NOT NULL AND qq != '' AND receive_qq_notifications = TRUE
      `;
    });
    return admins.map((admin: any) => admin.qq);
  } catch (error) {
    console.error('从数据库获取管理员QQ失败:', error);
    return [];
  }
}

// 通知管理员有新的白名单申请
export const notifyAdminsNewApplication = async (minecraftId: string, contact: string, age: number | null) => {
  if (!qqBotConfig) return;

  const message = `📝 新的白名单申请\n游戏ID: ${minecraftId}\n联系方式: ${contact}\n年龄: ${age || '未填写'}\n\n请及时登录管理后台审核！`;

  try {
    // 从数据库获取管理员QQ号
    const adminQqs = await getAdminQqs();
    console.log('获取到的管理员QQ号:', adminQqs);
    
    for (const adminQq of adminQqs) {
      await sendQqMessage(adminQq, message);
    }
  } catch (error) {
    console.error('获取管理员QQ号失败:', error);
  }
};

// 通知用户白名单申请通过
export const notifyUserApplicationApproved = async (qq: string, minecraftId: string, qqGroup: string, downloadUrl: string) => {
  if (!qqBotConfig) return;

  // 先发送好友请求
  await sendFriendRequest(qq, `白名单通过 - ${minecraftId}`);

  // 发送通知消息
  const message = `🎉 恭喜！您的白名单申请已通过\n\n游戏ID: ${minecraftId}\n\n📋 接下来请按以下步骤操作：\n\n1. 加入QQ群: ${qqGroup}\n2. 下载客户端: ${downloadUrl}\n3. 启动游戏，连接服务器\n\n服务器IP: mc.cloudtops.xyz\n服务器版本: 1.20.1 原版生存\n\n欢迎加入 Cloud tops 云顶之境！`;

  await sendQqMessage(qq, message);
};

// 通知用户白名单申请被拒绝
export const notifyUserApplicationRejected = async (qq: string, minecraftId: string, reason: string) => {
  if (!qqBotConfig) return;

  const message = `❌ 很遗憾，您的白名单申请未通过\n\n游戏ID: ${minecraftId}\n\n原因: ${reason || '未提供具体原因'}\n\n如有疑问，请联系管理员。`;

  await sendQqMessage(qq, message);
};
