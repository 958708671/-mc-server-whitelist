// 配置文件

// QQ机器人配置
export const qqBotConfig = {
  apiUrl: process.env.QQ_BOT_API_URL || 'http://localhost:5700',
  adminQqs: (process.env.QQ_BOT_ADMIN_QQS || '').split(',').filter(qq => qq.trim()),
  botQq: process.env.QQ_BOT_QQ || ''
};

// 初始化配置
export const initConfigs = () => {
  // 初始化QQ机器人
  if (qqBotConfig.apiUrl && qqBotConfig.adminQqs.length > 0 && qqBotConfig.botQq) {
    try {
      const { initQqBot } = require('./qq-bot');
      initQqBot(qqBotConfig);
      console.log('QQ机器人初始化成功');
    } catch (error) {
      console.error('QQ机器人初始化失败:', error);
    }
  } else {
    console.log('QQ机器人配置不完整，跳过初始化');
  }
};
