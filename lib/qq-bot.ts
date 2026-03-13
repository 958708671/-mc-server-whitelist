// QQ机器人消息推送功能
// 使用QQ开放平台API发送消息

interface QQBotConfig {
  appId: string;
  token: string;
  secret: string;
  sandbox?: boolean;
}

// 从环境变量获取配置
const getBotConfig = (): QQBotConfig | null => {
  const appId = process.env.QQ_BOT_APP_ID;
  const token = process.env.QQ_BOT_TOKEN;
  const secret = process.env.QQ_BOT_SECRET;
  
  if (!appId || !token || !secret) {
    console.log('QQ机器人配置不完整，请在.env.local中设置相关环境变量');
    return null;
  }
  
  return {
    appId,
    token,
    secret,
    sandbox: process.env.QQ_BOT_SANDBOX === 'true'
  };
};

// 获取Access Token
const getAccessToken = async (config: QQBotConfig): Promise<string | null> => {
  try {
    const response = await fetch('https://bots.qq.com/app/getAppAccessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        appId: config.appId,
        clientSecret: config.secret
      })
    });
    
    if (!response.ok) {
      throw new Error(`获取AccessToken失败: ${response.status}`);
    }
    
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('获取QQ机器人AccessToken失败:', error);
    return null;
  }
};

// 发送私聊消息
export const sendPrivateMessage = async (
  userId: string,
  content: string
): Promise<boolean> => {
  const config = getBotConfig();
  if (!config) {
    console.log('QQ机器人未配置，跳过发送消息');
    return false;
  }
  
  try {
    const accessToken = await getAccessToken(config);
    if (!accessToken) {
      return false;
    }
    
    const baseUrl = config.sandbox 
      ? 'https://sandbox.api.sgroup.qq.com'
      : 'https://api.sgroup.qq.com';
    
    const response = await fetch(`${baseUrl}/v2/users/${userId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `QQBot ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content,
        msg_type: 0 // 文本消息
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('发送QQ私聊消息失败:', errorData);
      return false;
    }
    
    console.log(`QQ私聊消息发送成功: ${userId}`);
    return true;
  } catch (error) {
    console.error('发送QQ私聊消息异常:', error);
    return false;
  }
};

// 发送群消息
export const sendGroupMessage = async (
  groupId: string,
  content: string
): Promise<boolean> => {
  const config = getBotConfig();
  if (!config) {
    console.log('QQ机器人未配置，跳过发送消息');
    return false;
  }
  
  try {
    const accessToken = await getAccessToken(config);
    if (!accessToken) {
      return false;
    }
    
    const baseUrl = config.sandbox 
      ? 'https://sandbox.api.sgroup.qq.com'
      : 'https://api.sgroup.qq.com';
    
    const response = await fetch(`${baseUrl}/v2/groups/${groupId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `QQBot ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content,
        msg_type: 0 // 文本消息
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('发送QQ群消息失败:', errorData);
      return false;
    }
    
    console.log(`QQ群消息发送成功: ${groupId}`);
    return true;
  } catch (error) {
    console.error('发送QQ群消息异常:', error);
    return false;
  }
};

// 通知管理员有新的白名单申请
export const notifyAdminsNewApplication = async (
  minecraftId: string,
  contact: string,
  age?: string
): Promise<void> => {
  const adminQQ = process.env.QQ_BOT_ADMIN_QQ;
  if (!adminQQ) {
    console.log('未配置管理员QQ，跳过通知');
    return;
  }
  
  const message = `📝 新的白名单申请

游戏ID: ${minecraftId}
联系方式: ${contact}
年龄: ${age || '未填写'}

请登录管理后台查看详情。`;
  
  await sendPrivateMessage(adminQQ, message);
};

// 通知用户申请已通过
export const notifyUserApplicationApproved = async (
  userQQ: string,
  minecraftId: string,
  qqGroup: string,
  downloadUrl: string
): Promise<void> => {
  const message = `🎉 恭喜！您的白名单申请已通过审核！

游戏ID: ${minecraftId}

📋 接下来请按以下步骤操作：
1. 加入QQ群: ${qqGroup}
2. 下载客户端: ${downloadUrl}
3. 在QQ群内获取服务器IP地址
4. 使用正版账号登录服务器

⚠️ 温馨提示：
- 请使用正版Minecraft客户端登录
- 服务器版本为 1.20.4
- 如有任何问题，请在QQ群内联系管理员

Cloud tops 云顶之境 - 一个纯净的 Minecraft 原版生存社区`;
  
  await sendPrivateMessage(userQQ, message);
};

// 通知用户申请被拒绝
export const notifyUserApplicationRejected = async (
  userQQ: string,
  minecraftId: string,
  reason: string
): Promise<void> => {
  const message = `😢 很遗憾，您的白名单申请未通过审核

游戏ID: ${minecraftId}

拒绝原因: ${reason || '未提供具体原因'}

💡 建议：
- 请检查您填写的信息是否准确完整
- 您可以修改申请内容后重新提交
- 如有疑问，请联系管理员

Cloud tops 云顶之境 - 一个纯净的 Minecraft 原版生存社区`;
  
  await sendPrivateMessage(userQQ, message);
};

// 发送服务器状态通知到QQ群
export const sendServerStatusToGroup = async (
  groupId: string,
  status: 'online' | 'offline',
  playerCount?: number
): Promise<void> => {
  const statusEmoji = status === 'online' ? '🟢' : '🔴';
  const statusText = status === 'online' ? '在线' : '离线';
  
  let message = `${statusEmoji} 服务器状态更新

当前状态: ${statusText}`;
  
  if (status === 'online' && playerCount !== undefined) {
    message += `\n在线人数: ${playerCount}`;
  }
  
  message += `\n\n更新时间: ${new Date().toLocaleString('zh-CN')}`;
  
  await sendGroupMessage(groupId, message);
};
