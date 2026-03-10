const EMAIL = '958708671@qq.com';
const BASE_URL = 'http://localhost:3000';
const OWNER_QQ = '958708671';
const OWNER_ID = 'ServerOwner';

const now = new Date();
const formatTime = (date) => date.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
const currentTime = formatTime(now);

const testData = {
  minecraftId: 'TestPlayer_2024',
  qqGroup: '666866913',
  downloadUrl: 'https://example.com/download',
  age: 22,
  contact: '123456789',
  gender: '男',
  occupation: '本科',
  play_time: 36,
  how_found: '朋友推荐',
  play_time_slot: '晚上',
  skill_type: '生存建造, 红石科技',
  banned_history: '否',
  banned_servers: '',
  quiz_category: '生存技巧, 红石电路, 建筑美学, 服务器规则',
  quiz_level: '掌握',
  quiz_score: 26,
  quiz_total: 30,
  pass_rate: '86.7%',
  rejectReason: '申请信息不完整，缺乏有效的游戏经验描述',
  revokeReason: '多次违反服务器规则，恶意破坏他人建筑',
  blacklistReason: '使用外挂作弊，严重影响游戏公平性',
  removeBlacklistReason: '经审核，该玩家已改正错误，符合重新申请条件',
  complaintId: 'CMP-20240310-001',
  targetPlayer: '违规玩家小红',
  violationType: '恶意破坏',
  violationTime: '2024-03-10 14:30:00',
  violationDescription: '该玩家使用TNT恶意炸毁了我的房子，包括仓库、农场和建筑。',
  reporterName: '举报者小明',
  reporterId: 'TestPlayer_2024',
  reporterQQ: '123456789',
  handlerName: '管理员张三',
  handlerId: 'Admin_ZhangSan',
  handlerQQ: '987654321',
  resolveResult: '经调查，被举报玩家确实存在恶意破坏行为，已给予警告并要求赔偿损失。',
  rejectReason_complaint: '经调查，未发现被举报玩家存在违规行为，证据不足。',
  announcementTitle: '服务器更新公告 - 新增建筑比赛活动',
  announcementContent: '亲爱的玩家们，我们将于本周六举办首届建筑比赛，主题为"未来城市"，欢迎大家踊跃参加！',
  eventTitle: '🎉 春节特别活动 - 红包雨来袭！',
  eventContent: '春节期间登录服务器即可参与红包雨活动，每日签到可获得丰厚奖励！'
};

const quizQuestions = [
  { id: 1, category: '服务器规则', type: '必答', isCorrect: true, question: '服务器是否允许使用作弊软件？', options: ['A. 允许', 'B. 不允许', 'C. 视情况而定', 'D. 只有管理员可以'], userAnswer: 'B', correctAnswer: 'B' },
  { id: 2, category: '服务器规则', type: '普通', isCorrect: true, question: '发现bug应该怎么做？', options: ['A. 自己利用', 'B. 告诉朋友', 'C. 向管理员报告', 'D. 无视'], userAnswer: 'C', correctAnswer: 'C' },
  { id: 3, category: '生存技巧', type: '必答', isCorrect: true, question: '如何快速获得大量木材？', options: ['A. 手动砍树', 'B. 建造树场', 'C. 与村民交易', 'D. 地牢寻找'], userAnswer: 'B', correctAnswer: 'B' },
  { id: 4, category: '生存技巧', type: '普通', isCorrect: true, question: '下界合金装备需要什么材料？', options: ['A. 钻石+金锭', 'B. 下界合金锭+钻石装备', 'C. 远古残骸+铁装备', 'D. 黑曜石+钻石'], userAnswer: 'B', correctAnswer: 'B' },
  { id: 5, category: '生存技巧', type: '普通', isCorrect: true, question: '如何防止怪物在基地附近生成？', options: ['A. 放置火把/半砖', 'B. 建造围墙', 'C. 养猫', 'D. 以上都可以'], userAnswer: 'A', correctAnswer: 'A' },
  { id: 6, category: '红石电路', type: '必答', isCorrect: true, question: '红石信号最长传输距离是多少？', options: ['A. 10格', 'B. 15格', 'C. 20格', 'D. 无限'], userAnswer: 'B', correctAnswer: 'B' },
  { id: 7, category: '红石电路', type: '普通', isCorrect: true, question: '如何制作一个自动门？', options: ['A. 压力板+活塞', 'B. 按钮+门', 'C. 拉杆+栅栏门', 'D. 红石火把+门'], userAnswer: 'A', correctAnswer: 'A' },
  { id: 8, category: '红石电路', type: '多选', isCorrect: true, question: '中继器的作用是什么？', options: ['A. 延长信号', 'B. 延迟信号', 'C. 增强信号', 'D. 改变信号方向'], userAnswer: 'A,B', correctAnswer: 'A,B' },
  { id: 9, category: '建筑美学', type: '普通', isCorrect: false, question: '中式建筑的屋顶特点是什么？', options: ['A. 平顶', 'B. 尖顶', 'C. 飞檐翘角', 'D. 圆顶'], userAnswer: 'B', correctAnswer: 'C' },
  { id: 10, category: '建筑美学', type: '普通', isCorrect: true, question: '哪种材料适合建造现代风格建筑？', options: ['A. 圆石', 'B. 混凝土/石英', 'C. 泥土', 'D. 木板'], userAnswer: 'B', correctAnswer: 'B' },
  { id: 11, category: '建筑美学', type: '多选', isCorrect: true, question: '如何让小屋看起来更有层次感？', options: ['A. 使用不同材质', 'B. 增加深度', 'C. 只用一种颜色', 'D. 建造得更高'], userAnswer: 'A,B', correctAnswer: 'A,B' },
  { id: 12, category: '建筑美学', type: '普通', isCorrect: true, question: '景观设计中的"留白"是指什么？', options: ['A. 什么都不建', 'B. 适当空旷区域', 'C. 用白色方块', 'D. 建造白墙'], userAnswer: 'B', correctAnswer: 'B' },
  { id: 13, category: '游戏机制', type: '普通', isCorrect: false, question: '刷怪笼的刷怪范围是多少？', options: ['A. 8x3x8', 'B. 8x8x3', 'C. 16x16x16', 'D. 10x10x10'], userAnswer: 'B', correctAnswer: 'A' },
  { id: 14, category: '游戏机制', type: '多选', isCorrect: true, question: '村民繁殖需要什么条件？', options: ['A. 床位', 'B. 食物', 'C. 门', 'D. 阳光'], userAnswer: 'A,B', correctAnswer: 'A,B' },
  { id: 15, category: '游戏机制', type: '普通', isCorrect: true, question: '如何快速找到要塞？', options: ['A. 随机挖掘', 'B. 末影之眼', 'C. 地图', 'D. 指南针'], userAnswer: 'B', correctAnswer: 'B' },
  { id: 16, category: '生存技巧', type: '普通', isCorrect: true, question: '哪种食物恢复的饥饿值最多？', options: ['A. 面包', 'B. 牛排', 'C. 金胡萝卜', 'D. 蛋糕'], userAnswer: 'C', correctAnswer: 'C' },
  { id: 17, category: '生存技巧', type: '普通', isCorrect: true, question: '如何获得末影珍珠？', options: ['A. 击杀末影人', 'B. 挖掘末地石', 'C. 与牧师交易', 'D. 以上都可以'], userAnswer: 'D', correctAnswer: 'D' },
  { id: 18, category: '红石电路', type: '普通', isCorrect: true, question: '观察者（侦测器）的作用是什么？', options: ['A. 检测方块更新', 'B. 检测玩家', 'C. 检测怪物', 'D. 检测时间'], userAnswer: 'A', correctAnswer: 'A' },
  { id: 19, category: '红石电路', type: '普通', isCorrect: true, question: '如何制作一个无限循环的红石脉冲？', options: ['A. 中继器+红石粉', 'B. 观察者+红石粉', 'C. 比较器+红石粉', 'D. 活塞+红石粉'], userAnswer: 'B', correctAnswer: 'B' },
  { id: 20, category: '建筑美学', type: '普通', isCorrect: true, question: '以下哪种方块会随时间氧化变色？', options: ['A. 铁块', 'B. 铜块', 'C. 金块', 'D. 钻石块'], userAnswer: 'B', correctAnswer: 'B' },
  { id: 21, category: '服务器规则', type: '普通', isCorrect: true, question: '在服务器中，以下哪种行为是被禁止的？', options: ['A. 建造房屋', 'B. 恶意破坏他人建筑', 'C. 种植作物', 'D. 养殖动物'], userAnswer: 'B', correctAnswer: 'B' },
  { id: 22, category: '游戏机制', type: '普通', isCorrect: false, question: '信标的光束最高可以穿过多少格？', options: ['A. 64格', 'B. 128格', 'C. 256格', 'D. 无限'], userAnswer: 'C', correctAnswer: 'D' },
  { id: 23, category: '游戏机制', type: '普通', isCorrect: true, question: '如何获得不死图腾？', options: ['A. 击杀唤魔者', 'B. 林地府邸宝箱', 'C. 与村民交易', 'D. 合成'], userAnswer: 'A', correctAnswer: 'A' },
  { id: 24, category: '生存技巧', type: '多选', isCorrect: true, question: '以下哪些生物可以驯服？', options: ['A. 狼', 'B. 猫', 'C. 马', 'D. 以上都可以'], userAnswer: 'D', correctAnswer: 'D' },
  { id: 25, category: '红石电路', type: '普通', isCorrect: true, question: '比较器的两种模式是什么？', options: ['A. 比较模式和减法模式', 'B. 加法模式和减法模式', 'C. 比较模式和放大模式', 'D. 正常模式和激活模式'], userAnswer: 'A', correctAnswer: 'A' },
  { id: 26, category: '建筑美学', type: '普通', isCorrect: true, question: '以下哪种方块可以用来制作隐形展示框？', options: ['A. 展示框+隐形药水', 'B. 展示框+萤石粉', 'C. 展示框+下界之星', 'D. 展示框+末影之眼'], userAnswer: 'A', correctAnswer: 'A' },
  { id: 27, category: '服务器规则', type: '普通', isCorrect: true, question: '如果发现自己的建筑被破坏了，应该怎么做？', options: ['A. 报复破坏者', 'B. 向管理员举报', 'C. 自己修复', 'D. 放弃这个建筑'], userAnswer: 'B', correctAnswer: 'B' },
  { id: 28, category: '游戏机制', type: '普通', isCorrect: false, question: '一个区块（Chunk）的大小是多少？', options: ['A. 8x8格', 'B. 16x16格', 'C. 32x32格', 'D. 64x64格'], userAnswer: 'C', correctAnswer: 'B' },
  { id: 29, category: '生存技巧', type: '普通', isCorrect: true, question: '如何快速到达下界要塞？', options: ['A. 随机传送', 'B. 沿着X轴或Z轴走', 'C. 向上挖', 'D. 向下挖'], userAnswer: 'B', correctAnswer: 'B' },
  { id: 30, category: '红石电路', type: '普通', isCorrect: true, question: '以下哪种方块可以被活塞推动？', options: ['A. 黑曜石', 'B. 基岩', 'C. 石头', 'D. 末地传送门框架'], userAnswer: 'C', correctAnswer: 'C' }
];

const categoryColors = {
  '服务器规则': '#dc2626',
  '生存技巧': '#16a34a',
  '红石电路': '#dc2626',
  '建筑美学': '#7c3aed',
  '游戏机制': '#0284c7'
};

function calculateCategoryStats() {
  const stats = {};
  quizQuestions.forEach((q, index) => {
    if (!stats[q.category]) {
      stats[q.category] = { total: 0, correct: 0, questionNumbers: [] };
    }
    stats[q.category].total++;
    stats[q.category].questionNumbers.push(index + 1);
    if (q.isCorrect) stats[q.category].correct++;
  });
  
  return Object.entries(stats).map(([category, data]) => ({
    category,
    total: data.total,
    correct: data.correct,
    rate: ((data.correct / data.total) * 100).toFixed(1),
    questionNumbers: data.questionNumbers
  }));
}

function generateQuizHtml() {
  const categoryStats = calculateCategoryStats();
  
  const statsHtml = categoryStats.map(stat => {
    const bgColor = parseFloat(stat.rate) >= 80 ? '#dcfce7' : parseFloat(stat.rate) >= 60 ? '#fef3c7' : '#fee2e2';
    const textColor = parseFloat(stat.rate) >= 80 ? '#16a34a' : parseFloat(stat.rate) >= 60 ? '#d97706' : '#dc2626';
    const categoryColor = categoryColors[stat.category] || '#374151';
    return `
      <tr style="background: ${bgColor};">
        <td style="padding: 10px 15px; font-size: 13px; font-weight: bold; color: ${categoryColor};">${stat.category}</td>
        <td style="padding: 10px 15px; font-size: 14px; color: ${textColor}; font-weight: bold; text-align: center;">${stat.correct}/${stat.total}</td>
        <td style="padding: 10px 15px; font-size: 13px; color: ${textColor}; text-align: center;">${stat.rate}%</td>
        <td style="padding: 10px 15px; font-size: 11px; color: #6b7280; text-align: center;">${stat.questionNumbers.join(', ')}</td>
      </tr>
    `;
  }).join('');
  
  let questionsHtml = '';
  quizQuestions.forEach((q, index) => {
    const optionsLine = q.options.join(' | ');
    const statusColor = q.isCorrect ? '#16a34a' : '#dc2626';
    const statusText = q.isCorrect ? '✓' : '✗';
    const categoryColor = categoryColors[q.category] || '#374151';
    
    questionsHtml += `
      <div style="background: ${q.isCorrect ? '#f0fdf4' : '#fef2f2'}; padding: 10px 12px; border-radius: 6px; margin: 6px 0; border-left: 3px solid ${statusColor};">
        <p style="color: #333; margin: 0 0 6px 0; font-size: 13px; line-height: 1.4;">
          <strong>${index + 1}.</strong> ${q.question} 
          <span style="background: ${categoryColor}; color: white; padding: 1px 6px; border-radius: 3px; font-size: 10px;">${q.category}</span>
          <span style="color: ${q.type === '必答' ? '#dc2626' : q.type === '多选' ? '#7c3aed' : '#0284c7'}; font-size: 11px;">[${q.type}]</span>
          <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span>
        </p>
        <p style="color: #666; margin: 0 0 4px 0; font-size: 11px; line-height: 1.3;">${optionsLine}</p>
        <p style="color: #333; margin: 0; font-size: 11px;">
          <strong>您的答案：</strong><span style="color: ${q.isCorrect ? '#16a34a' : '#dc2626'}">${q.userAnswer}</span> | 
          <strong>正确答案：</strong><span style="color: #16a34a">${q.correctAnswer}</span>
        </p>
      </div>
    `;
  });
  
  return { statsHtml, questionsHtml };
}

const emails = [
  {
    name: '1. 白名单申请提交确认（用户版）',
    to: EMAIL,
    subject: '📝 白名单申请已提交 - Cloud tops 云顶之境',
    html: (() => {
      const { statsHtml, questionsHtml } = generateQuizHtml();
      return `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">📝 申请已提交</h1>
        <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">我们已收到您的白名单申请</p>
      </div>
      
      <div style="background: white; padding: 25px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          亲爱的 <strong>${testData.minecraftId}</strong>，
        </p>
        
        <p style="color: #666; font-size: 14px; line-height: 1.8;">
          您的白名单申请已成功提交！
        </p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3 style="color: #333; margin: 0 0 12px 0; font-size: 15px;">📋 申请信息</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <p style="color: #666; margin: 0; font-size: 12px;"><strong>游戏ID：</strong>${testData.minecraftId}</p>
            <p style="color: #666; margin: 0; font-size: 12px;"><strong>QQ号：</strong>${testData.contact}</p>
            <p style="color: #666; margin: 0; font-size: 12px;"><strong>年龄：</strong>${testData.age}岁</p>
            <p style="color: #666; margin: 0; font-size: 12px;"><strong>性别：</strong>${testData.gender}</p>
            <p style="color: #666; margin: 0; font-size: 12px;"><strong>身份/学历：</strong>${testData.occupation}</p>
            <p style="color: #666; margin: 0; font-size: 12px;"><strong>游戏时长：</strong>${testData.play_time}个月</p>
            <p style="color: #666; margin: 0; font-size: 12px;"><strong>擅长类型：</strong>${testData.skill_type}</p>
            <p style="color: #666; margin: 0; font-size: 12px;"><strong>游玩时段：</strong>${testData.play_time_slot}</p>
            <p style="color: #666; margin: 0; font-size: 12px;"><strong>了解渠道：</strong>${testData.how_found}</p>
            <p style="color: #666; margin: 0; font-size: 12px;"><strong>被ban历史：</strong>${testData.banned_history}</p>
          </div>
          <p style="color: #666; margin: 8px 0 0 0; font-size: 12px;"><strong>申请时间：</strong>${currentTime}</p>
          <p style="color: #666; margin: 4px 0 0 0; font-size: 12px;"><strong>申请状态：</strong><span style="color: #f59e0b; font-weight: bold;">待审核</span></p>
        </div>
        
        <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 15px; border-radius: 8px; margin: 15px 0; border: 2px solid #3b82f6;">
          <h3 style="color: #1e40af; margin: 0 0 12px 0; font-size: 15px;">📝 答题信息</h3>
          <div style="display: flex; justify-content: space-around; text-align: center; margin-bottom: 12px;">
            <div>
              <p style="color: #666; margin: 0; font-size: 11px;">选择题库</p>
              <p style="color: #333; margin: 4px 0 0 0; font-size: 12px; font-weight: bold;">${testData.quiz_category}</p>
            </div>
            <div>
              <p style="color: #666; margin: 0; font-size: 11px;">掌握程度</p>
              <p style="color: #333; margin: 4px 0 0 0; font-size: 12px; font-weight: bold;">${testData.quiz_level}</p>
            </div>
            <div>
              <p style="color: #666; margin: 0; font-size: 11px;">得分</p>
              <p style="color: #16a34a; margin: 4px 0 0 0; font-size: 18px; font-weight: bold;">${testData.quiz_score}/${testData.quiz_total}</p>
            </div>
            <div>
              <p style="color: #666; margin: 0; font-size: 11px;">正确率</p>
              <p style="color: #3b82f6; margin: 4px 0 0 0; font-size: 18px; font-weight: bold;">${testData.pass_rate}</p>
            </div>
          </div>
          <p style="text-align: center; color: #16a34a; font-size: 13px; margin: 0; font-weight: bold;">✅ 已通过答题测试（≥85%）</p>
        </div>
        
        <div style="background: #fafafa; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3 style="color: #374151; margin: 0 0 12px 0; font-size: 15px;">📊 题库正确率统计</h3>
          <table style="width: 100%; border-collapse: separate; border-spacing: 0 6px;">
            <thead>
              <tr style="background: #e5e7eb;">
                <th style="padding: 8px 15px; font-size: 12px; color: #374151; text-align: left; border-radius: 6px 0 0 6px;">题库名称</th>
                <th style="padding: 8px 15px; font-size: 12px; color: #374151; text-align: center;">得分</th>
                <th style="padding: 8px 15px; font-size: 12px; color: #374151; text-align: center;">正确率</th>
                <th style="padding: 8px 15px; font-size: 12px; color: #374151; text-align: center; border-radius: 0 6px 6px 0;">题目编号</th>
              </tr>
            </thead>
            <tbody>
              ${statsHtml}
            </tbody>
          </table>
        </div>
        
        <div style="background: #fafafa; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3 style="color: #374151; margin: 0 0 12px 0; font-size: 15px;">📋 答题详情（共30题）</h3>
          ${questionsHtml}
        </div>
        
        <div style="background: #e3f2fd; padding: 12px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #1976d2;">
          <p style="margin: 0; color: #1976d2; font-size: 13px;"><strong>⏰ 审核时间：</strong>管理员将在24小时内审核您的申请</p>
        </div>
        
        <p style="color: #999; font-size: 11px; text-align: center; margin-top: 20px;">
          此邮件由系统自动发送，请勿直接回复。<br>
          Cloud tops 云顶之境 - 一个纯净的 Minecraft 原版生存社区
        </p>
      </div>
    </div>`;
    })()
  },
  {
    name: '2. 白名单申请通知（管理员版）',
    to: EMAIL,
    subject: `🔔 新的白名单申请待处理 - ${testData.minecraftId}`,
    html: (() => {
      const { statsHtml, questionsHtml } = generateQuizHtml();
      return `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">🔔 新的白名单申请</h1>
        <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">有新的申请待处理</p>
      </div>
      
      <div style="background: white; padding: 25px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3 style="color: #333; margin: 0 0 12px 0; font-size: 15px;">📋 申请信息</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <p style="color: #666; margin: 0; font-size: 12px;"><strong>游戏ID：</strong>${testData.minecraftId}</p>
            <p style="color: #666; margin: 0; font-size: 12px;"><strong>QQ号：</strong>${testData.contact}</p>
            <p style="color: #666; margin: 0; font-size: 12px;"><strong>年龄：</strong>${testData.age}岁</p>
            <p style="color: #666; margin: 0; font-size: 12px;"><strong>性别：</strong>${testData.gender}</p>
            <p style="color: #666; margin: 0; font-size: 12px;"><strong>身份/学历：</strong>${testData.occupation}</p>
            <p style="color: #666; margin: 0; font-size: 12px;"><strong>游戏时长：</strong>${testData.play_time}个月</p>
            <p style="color: #666; margin: 0; font-size: 12px;"><strong>擅长类型：</strong>${testData.skill_type}</p>
            <p style="color: #666; margin: 0; font-size: 12px;"><strong>游玩时段：</strong>${testData.play_time_slot}</p>
            <p style="color: #666; margin: 0; font-size: 12px;"><strong>了解渠道：</strong>${testData.how_found}</p>
            <p style="color: #666; margin: 0; font-size: 12px;"><strong>被ban历史：</strong>${testData.banned_history}</p>
          </div>
          <p style="color: #666; margin: 8px 0 0 0; font-size: 12px;"><strong>申请时间：</strong>${currentTime}</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 15px; border-radius: 8px; margin: 15px 0; border: 2px solid #3b82f6;">
          <h3 style="color: #1e40af; margin: 0 0 12px 0; font-size: 15px;">📝 答题信息</h3>
          <div style="display: flex; justify-content: space-around; text-align: center; margin-bottom: 12px;">
            <div>
              <p style="color: #666; margin: 0; font-size: 11px;">选择题库</p>
              <p style="color: #333; margin: 4px 0 0 0; font-size: 12px; font-weight: bold;">${testData.quiz_category}</p>
            </div>
            <div>
              <p style="color: #666; margin: 0; font-size: 11px;">掌握程度</p>
              <p style="color: #333; margin: 4px 0 0 0; font-size: 12px; font-weight: bold;">${testData.quiz_level}</p>
            </div>
            <div>
              <p style="color: #666; margin: 0; font-size: 11px;">得分</p>
              <p style="color: #16a34a; margin: 4px 0 0 0; font-size: 18px; font-weight: bold;">${testData.quiz_score}/${testData.quiz_total}</p>
            </div>
            <div>
              <p style="color: #666; margin: 0; font-size: 11px;">正确率</p>
              <p style="color: #3b82f6; margin: 4px 0 0 0; font-size: 18px; font-weight: bold;">${testData.pass_rate}</p>
            </div>
          </div>
        </div>
        
        <div style="background: #fafafa; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3 style="color: #374151; margin: 0 0 12px 0; font-size: 15px;">📊 题库正确率统计</h3>
          <table style="width: 100%; border-collapse: separate; border-spacing: 0 6px;">
            <thead>
              <tr style="background: #e5e7eb;">
                <th style="padding: 8px 15px; font-size: 12px; color: #374151; text-align: left; border-radius: 6px 0 0 6px;">题库名称</th>
                <th style="padding: 8px 15px; font-size: 12px; color: #374151; text-align: center;">得分</th>
                <th style="padding: 8px 15px; font-size: 12px; color: #374151; text-align: center;">正确率</th>
                <th style="padding: 8px 15px; font-size: 12px; color: #374151; text-align: center; border-radius: 0 6px 6px 0;">题目编号</th>
              </tr>
            </thead>
            <tbody>
              ${statsHtml}
            </tbody>
          </table>
        </div>
        
        <div style="background: #fafafa; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3 style="color: #374151; margin: 0 0 12px 0; font-size: 15px;">📋 答题详情（共30题）</h3>
          ${questionsHtml}
        </div>
        
        <center style="margin-top: 20px;">
          <a href="${BASE_URL}/admin/applications" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 500;">前往处理</a>
        </center>
      </div>
    </div>`;
    })()
  },
  {
    name: '3. 白名单审核通过',
    to: EMAIL,
    subject: '🎉 恭喜！您的白名单申请已通过 - Cloud tops 云顶之境',
    html: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <div style="font-size: 48px; margin-bottom: 15px;">🎉</div>
        <h1 style="color: white; margin: 0; font-size: 28px;">恭喜！</h1>
        <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">您的白名单申请已通过审核</p>
      </div>
      <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px;">
        <p style="color: #374151; font-size: 16px;">亲爱的 <strong>${testData.minecraftId}</strong>，</p>
        <p style="color: #6b7280; font-size: 15px; line-height: 1.8;">恭喜您通过了 Cloud tops 云顶之境服务器的白名单审核！</p>
        
        <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 25px; border-radius: 12px; margin: 20px 0; border: 2px solid #3b82f6;">
          <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 16px;">📋 接下来请按以下步骤操作：</h3>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 12px; background: white; padding: 12px 15px; border-radius: 8px;">
              <span style="background: #3b82f6; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">1</span>
              <span style="color: #374151; font-size: 14px;">加入QQ群：<strong style="color: #3b82f6;">${testData.qqGroup}</strong></span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px; background: white; padding: 12px 15px; border-radius: 8px;">
              <span style="background: #3b82f6; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">2</span>
              <span style="color: #374151; font-size: 14px;">下载客户端整合包</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px; background: white; padding: 12px 15px; border-radius: 8px;">
              <span style="background: #3b82f6; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">3</span>
              <span style="color: #374151; font-size: 14px;">在QQ群内获取服务器IP地址</span>
            </div>
          </div>
        </div>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 12px; margin: 20px 0; border: 2px solid #f59e0b;">
          <h3 style="color: #92400e; margin: 0 0 12px 0; font-size: 15px;">⚠️ 温馨提示</h3>
          <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 13px; line-height: 1.8;">
            <li>服务器版本为 <strong>1.21.1</strong></li>
            <li>如有任何问题，请在QQ群内联系管理员</li>
          </ul>
        </div>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; margin: 20px 0; border: 2px solid #10b981;">
          <h3 style="color: #166534; margin: 0 0 12px 0; font-size: 15px;">📝 审核信息</h3>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>审核结果：</strong><span style="color: #16a34a; font-weight: bold;">✅ 通过</span></p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>审核人：</strong>${testData.handlerName}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>审核人ID：</strong>${testData.handlerId}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>审核人QQ：</strong>${testData.handlerQQ}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>审核时间：</strong>${currentTime}</p>
        </div>
      </div>
    </div>`
  },
  {
    name: '4. 白名单审核拒绝',
    to: EMAIL,
    subject: '😢 很遗憾，您的白名单申请未通过 - Cloud tops 云顶之境',
    html: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
      <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <div style="font-size: 48px; margin-bottom: 15px;">😢</div>
        <h1 style="color: white; margin: 0; font-size: 28px;">很遗憾</h1>
        <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">您的白名单申请未通过审核</p>
      </div>
      <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px;">
        <p style="color: #374151; font-size: 16px;">亲爱的 <strong>${testData.minecraftId}</strong>，</p>
        <p style="color: #6b7280; font-size: 15px; line-height: 1.8;">很遗憾，您的白名单申请未通过审核。</p>
        
        <div style="background: #fef2f2; padding: 25px; border-radius: 12px; margin: 20px 0; border: 2px solid #ef4444;">
          <h3 style="color: #dc2626; margin: 0 0 12px 0; font-size: 16px;">❌ 拒绝原因</h3>
          <p style="color: #7f1d1d; font-size: 14px; line-height: 1.6; margin: 0;">${testData.rejectReason}</p>
        </div>
        
        <div style="background: #eff6ff; padding: 25px; border-radius: 12px; border: 2px solid #3b82f6;">
          <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 16px;">💡 建议</h3>
          <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px; line-height: 1.8;">
            <li>请检查您填写的信息是否准确完整</li>
            <li>您可以修改申请内容后重新提交</li>
            <li>如有疑问，请联系管理员QQ: ${OWNER_QQ}</li>
          </ul>
        </div>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 12px; margin: 20px 0; border: 2px solid #dc2626;">
          <h3 style="color: #dc2626; margin: 0 0 12px 0; font-size: 15px;">📝 审核信息</h3>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>审核结果：</strong><span style="color: #dc2626; font-weight: bold;">❌ 拒绝</span></p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>审核人：</strong>${testData.handlerName}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>审核人ID：</strong>${testData.handlerId}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>审核人QQ：</strong>${testData.handlerQQ}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>审核时间：</strong>${currentTime}</p>
        </div>
      </div>
    </div>`
  },
  {
    name: '5. 白名单撤销通知',
    to: EMAIL,
    subject: '🚫 白名单已被撤销 - Cloud tops 云顶之境',
    html: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
      <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <div style="font-size: 48px; margin-bottom: 15px;">🚫</div>
        <h1 style="color: white; margin: 0; font-size: 28px;">白名单已撤销</h1>
        <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">您的服务器白名单已被撤销</p>
      </div>
      <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px;">
        <p style="color: #374151; font-size: 16px;">亲爱的 <strong>${testData.minecraftId}</strong>，</p>
        <p style="color: #6b7280; font-size: 15px; line-height: 1.8;">您的 Cloud tops 云顶之境服务器白名单已被撤销，您将无法再连接到服务器。</p>
        
        <div style="background: #fef2f2; padding: 25px; border-radius: 12px; margin: 20px 0; border: 2px solid #dc2626;">
          <h3 style="color: #dc2626; margin: 0 0 12px 0; font-size: 16px;">❌ 撤销原因</h3>
          <p style="color: #7f1d1d; font-size: 14px; line-height: 1.6; margin: 0;">${testData.revokeReason}</p>
        </div>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 12px; margin: 20px 0; border: 2px solid #dc2626;">
          <h3 style="color: #dc2626; margin: 0 0 12px 0; font-size: 15px;">📝 操作记录</h3>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>操作类型：</strong>白名单撤销</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>操作人：</strong>${testData.handlerName}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>操作人ID：</strong>${testData.handlerId}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>操作人QQ：</strong>${testData.handlerQQ}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>操作时间：</strong>${currentTime}</p>
        </div>
        
        <div style="background: #eff6ff; padding: 20px; border-radius: 12px; border: 1px solid #bfdbfe;">
          <p style="margin: 0; color: #1e40af; font-size: 14px;"><strong>🔄 重新申请：</strong>您可以在整改后重新提交白名单申请。</p>
        </div>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 12px; margin-top: 20px;">
          <p style="margin: 0; color: #666; font-size: 13px;"><strong>申诉渠道：</strong>如有异议，请联系管理员QQ: ${OWNER_QQ} 进行申诉。</p>
        </div>
      </div>
    </div>`
  },
  {
    name: '6. 白名单拉黑通知',
    to: EMAIL,
    subject: '⛔ 您已被拉入黑名单 - Cloud tops 云顶之境',
    html: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
      <div style="background: linear-gradient(135deg, #7c2d12 0%, #450a0a 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <div style="font-size: 48px; margin-bottom: 15px;">⛔</div>
        <h1 style="color: white; margin: 0; font-size: 28px;">已被拉黑</h1>
        <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">您已被加入服务器黑名单</p>
      </div>
      <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px;">
        <p style="color: #374151; font-size: 16px;">亲爱的 <strong>${testData.minecraftId}</strong>，</p>
        <p style="color: #6b7280; font-size: 15px; line-height: 1.8;">由于您的违规行为，您已被永久拉入 Cloud tops 云顶之境服务器黑名单。</p>
        
        <div style="background: #fef2f2; padding: 25px; border-radius: 12px; margin: 20px 0; border: 2px solid #dc2626;">
          <h3 style="color: #dc2626; margin: 0 0 12px 0; font-size: 16px;">⛔ 拉黑原因</h3>
          <p style="color: #7f1d1d; font-size: 14px; line-height: 1.6; margin: 0;">${testData.blacklistReason}</p>
        </div>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 12px; margin: 20px 0; border: 2px solid #7c2d12;">
          <h3 style="color: #7c2d12; margin: 0 0 12px 0; font-size: 15px;">📝 操作记录</h3>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>操作类型：</strong>拉入黑名单</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>操作人：</strong>${testData.handlerName}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>操作人ID：</strong>${testData.handlerId}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>操作人QQ：</strong>${testData.handlerQQ}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>操作时间：</strong>${currentTime}</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 12px;">
          <p style="margin: 0; color: #666; font-size: 13px;"><strong>申诉渠道：</strong>如有异议，请联系管理员QQ: ${OWNER_QQ} 进行申诉。</p>
        </div>
      </div>
    </div>`
  },
  {
    name: '7. 黑名单移除通知',
    to: EMAIL,
    subject: '✅ 您已从黑名单移除 - Cloud tops 云顶之境',
    html: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <div style="font-size: 48px; margin-bottom: 15px;">✅</div>
        <h1 style="color: white; margin: 0; font-size: 28px;">已移除黑名单</h1>
        <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">您可以重新申请白名单了</p>
      </div>
      <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px;">
        <p style="color: #374151; font-size: 16px;">亲爱的 <strong>${testData.minecraftId}</strong>，</p>
        <p style="color: #6b7280; font-size: 15px; line-height: 1.8;">您已从 Cloud tops 云顶之境服务器黑名单中移除，现在可以重新申请白名单了。</p>
        
        <div style="background: #f0fdf4; padding: 25px; border-radius: 12px; margin: 20px 0; border: 2px solid #10b981;">
          <h3 style="color: #166534; margin: 0 0 12px 0; font-size: 16px;">✅ 移除原因</h3>
          <p style="color: #166534; font-size: 14px; line-height: 1.6; margin: 0;">${testData.removeBlacklistReason}</p>
        </div>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; margin: 20px 0; border: 2px solid #10b981;">
          <h3 style="color: #166534; margin: 0 0 12px 0; font-size: 15px;">📝 操作记录</h3>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>操作类型：</strong>移除黑名单</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>操作人：</strong>${testData.handlerName}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>操作人ID：</strong>${testData.handlerId}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>操作人QQ：</strong>${testData.handlerQQ}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>操作时间：</strong>${currentTime}</p>
        </div>
        
        <center>
          <a href="${BASE_URL}/apply" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 500; margin-top: 20px;">重新申请白名单</a>
        </center>
      </div>
    </div>`
  },
  {
    name: '8. 投诉提交确认',
    to: EMAIL,
    subject: '📨 投诉已提交 - Cloud tops 云顶之境',
    html: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
      <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <div style="font-size: 48px; margin-bottom: 15px;">📨</div>
        <h1 style="color: white; margin: 0; font-size: 28px;">投诉已提交</h1>
        <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">我们已收到您的投诉</p>
      </div>
      <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px;">
        <p style="color: #374151; font-size: 16px;">亲爱的 <strong>${testData.reporterName}</strong>，</p>
        <p style="color: #6b7280; font-size: 15px; line-height: 1.8;">您的投诉已成功提交，我们的管理员将在48小时内处理您的投诉。</p>
        
        <div style="background: #f5f3ff; padding: 25px; border-radius: 12px; margin: 20px 0; border: 2px solid #8b5cf6;">
          <h3 style="color: #5b21b6; margin: 0 0 15px 0; font-size: 16px;">📋 投诉信息</h3>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>投诉编号:</strong> ${testData.complaintId}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>举报人:</strong> ${testData.reporterName} (${testData.reporterQQ})</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>被举报玩家:</strong> ${testData.targetPlayer}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>违规类型:</strong> ${testData.violationType}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>违规时间:</strong> ${testData.violationTime}</p>
          <p style="margin: 10px 0 0 0; color: #374151; font-size: 14px;"><strong>违规描述:</strong><br>${testData.violationDescription}</p>
        </div>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 12px; border: 1px solid #f59e0b;">
          <p style="margin: 0; color: #92400e; font-size: 13px;"><strong>⏰ 处理时限：</strong>管理员将在48小时内处理您的投诉，请耐心等待。</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 12px; margin-top: 20px;">
          <p style="margin: 0; color: #666; font-size: 13px;"><strong>提交时间：</strong>${currentTime}</p>
        </div>
      </div>
    </div>`
  },
  {
    name: '9. 投诉提交通知（管理员）',
    to: EMAIL,
    subject: `🚨 新的投诉举报待处理 - ${testData.targetPlayer}`,
    html: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
      <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <div style="font-size: 48px; margin-bottom: 15px;">🚨</div>
        <h1 style="color: white; margin: 0; font-size: 28px;">新的投诉</h1>
        <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">有新的投诉举报待处理</p>
      </div>
      <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px;">
        <div style="background: #fef2f2; padding: 25px; border-radius: 12px; margin-bottom: 20px; border: 2px solid #ef4444;">
          <h3 style="color: #dc2626; margin: 0 0 15px 0; font-size: 16px;">📋 投诉信息</h3>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>投诉编号:</strong> ${testData.complaintId}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>举报人:</strong> ${testData.reporterName} (${testData.reporterQQ})</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>举报人ID:</strong> ${testData.reporterId}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>被举报玩家:</strong> ${testData.targetPlayer}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>违规类型:</strong> ${testData.violationType}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>违规时间:</strong> ${testData.violationTime}</p>
          <p style="margin: 10px 0 0 0; color: #374151; font-size: 14px;"><strong>违规描述:</strong><br>${testData.violationDescription}</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 12px; margin-bottom: 20px;">
          <p style="margin: 0; color: #666; font-size: 13px;"><strong>提交时间：</strong>${currentTime}</p>
        </div>
        
        <center>
          <a href="${BASE_URL}/admin/complaints" style="display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 500;">前往处理</a>
        </center>
      </div>
    </div>`
  },
  {
    name: '10. 投诉已受理',
    to: EMAIL,
    subject: `📋 投诉已受理 - ${testData.complaintId}`,
    html: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <div style="font-size: 48px; margin-bottom: 15px;">📋</div>
        <h1 style="color: white; margin: 0; font-size: 28px;">投诉已受理</h1>
        <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">您的投诉已被管理员受理</p>
      </div>
      <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px;">
        <p style="color: #374151; font-size: 16px;">亲爱的 <strong>${testData.reporterName}</strong>，</p>
        <p style="color: #6b7280; font-size: 15px; line-height: 1.8;">您的投诉已被管理员受理，我们将尽快处理。</p>
        
        <div style="background: #eff6ff; padding: 25px; border-radius: 12px; margin: 20px 0; border: 2px solid #3b82f6;">
          <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 16px;">📋 投诉信息</h3>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>投诉编号:</strong> ${testData.complaintId}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>被举报玩家:</strong> ${testData.targetPlayer}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>违规类型:</strong> ${testData.violationType}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>违规时间:</strong> ${testData.violationTime}</p>
          <p style="margin: 10px 0 0 0; color: #374151; font-size: 14px;"><strong>违规描述:</strong><br>${testData.violationDescription}</p>
        </div>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; margin: 20px 0; border: 2px solid #10b981;">
          <h3 style="color: #166534; margin: 0 0 12px 0; font-size: 16px;">👤 受理管理员</h3>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>管理员:</strong> ${testData.handlerName}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>管理员ID:</strong> ${testData.handlerId}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>联系方式:</strong> QQ ${testData.handlerQQ}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>受理时间:</strong> ${currentTime}</p>
        </div>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 12px; border: 1px solid #f59e0b;">
          <p style="margin: 0; color: #92400e; font-size: 13px;"><strong>⚠️ 重要提示：</strong>管理员可能会联系您了解更多细节，请保持联系方式畅通，积极配合调查工作。</p>
        </div>
      </div>
    </div>`
  },
  {
    name: '11. 投诉处理结果（已解决）',
    to: EMAIL,
    subject: `✅ 投诉已处理 - ${testData.complaintId}`,
    html: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <div style="font-size: 48px; margin-bottom: 15px;">✅</div>
        <h1 style="color: white; margin: 0; font-size: 28px;">投诉已处理</h1>
        <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">您的投诉已处理完成</p>
      </div>
      <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px;">
        <p style="color: #374151; font-size: 16px;">亲爱的 <strong>${testData.reporterName}</strong>，</p>
        <p style="color: #6b7280; font-size: 15px; line-height: 1.8;">您的投诉已处理完成，感谢您的反馈！</p>
        
        <div style="background: #eff6ff; padding: 25px; border-radius: 12px; margin: 20px 0; border: 2px solid #3b82f6;">
          <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 16px;">📋 投诉信息</h3>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>投诉编号:</strong> ${testData.complaintId}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>被举报玩家:</strong> ${testData.targetPlayer}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>违规类型:</strong> ${testData.violationType}</p>
        </div>
        
        <div style="background: #f0fdf4; padding: 25px; border-radius: 12px; margin: 20px 0; border: 2px solid #10b981;">
          <h3 style="color: #166534; margin: 0 0 12px 0; font-size: 16px;">✅ 处理结果</h3>
          <p style="color: #166534; font-size: 14px; line-height: 1.6; margin: 0;">${testData.resolveResult}</p>
        </div>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; margin: 20px 0; border: 2px solid #10b981;">
          <h3 style="color: #166534; margin: 0 0 12px 0; font-size: 15px;">📝 操作记录</h3>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>处理结果：</strong><span style="color: #16a34a; font-weight: bold;">已解决</span></p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>处理人：</strong>${testData.handlerName}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>处理人ID：</strong>${testData.handlerId}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>处理人QQ：</strong>${testData.handlerQQ}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>处理时间：</strong>${currentTime}</p>
        </div>
      </div>
    </div>`
  },
  {
    name: '12. 投诉处理结果（已驳回）',
    to: EMAIL,
    subject: `❌ 投诉已驳回 - ${testData.complaintId}`,
    html: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
      <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <div style="font-size: 48px; margin-bottom: 15px;">❌</div>
        <h1 style="color: white; margin: 0; font-size: 28px;">投诉已驳回</h1>
        <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">您的投诉已被驳回</p>
      </div>
      <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px;">
        <p style="color: #374151; font-size: 16px;">亲爱的 <strong>${testData.reporterName}</strong>，</p>
        
        <div style="background: #eff6ff; padding: 25px; border-radius: 12px; margin: 20px 0; border: 2px solid #3b82f6;">
          <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 16px;">📋 投诉信息</h3>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>投诉编号:</strong> ${testData.complaintId}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>被举报玩家:</strong> ${testData.targetPlayer}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>违规类型:</strong> ${testData.violationType}</p>
        </div>
        
        <div style="background: #fef2f2; padding: 25px; border-radius: 12px; margin: 20px 0; border: 2px solid #ef4444;">
          <h3 style="color: #dc2626; margin: 0 0 12px 0; font-size: 16px;">❌ 驳回原因</h3>
          <p style="color: #7f1d1d; font-size: 14px; line-height: 1.6; margin: 0;">${testData.rejectReason_complaint}</p>
        </div>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 12px; margin: 20px 0; border: 2px solid #dc2626;">
          <h3 style="color: #dc2626; margin: 0 0 12px 0; font-size: 15px;">📝 操作记录</h3>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>处理结果：</strong><span style="color: #dc2626; font-weight: bold;">已驳回</span></p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>处理人：</strong>${testData.handlerName}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>处理人ID：</strong>${testData.handlerId}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>处理人QQ：</strong>${testData.handlerQQ}</p>
          <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>处理时间：</strong>${currentTime}</p>
        </div>
      </div>
    </div>`
  },
  {
    name: '13. 服务器公告通知',
    to: EMAIL,
    subject: `📢 ${testData.announcementTitle} - Cloud tops 云顶之境`,
    html: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <div style="font-size: 48px; margin-bottom: 15px;">📢</div>
        <h1 style="color: white; margin: 0; font-size: 28px;">服务器公告</h1>
        <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">Cloud tops 云顶之境</p>
      </div>
      <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px;">
        <h2 style="color: #1e40af; margin: 0 0 20px 0; font-size: 20px;">${testData.announcementTitle}</h2>
        <div style="background: #eff6ff; padding: 25px; border-radius: 12px; margin: 20px 0; border: 2px solid #3b82f6;">
          <p style="color: #374151; font-size: 15px; line-height: 1.8; margin: 0;">${testData.announcementContent}</p>
        </div>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 12px;">
          <p style="margin: 0; color: #666; font-size: 13px;"><strong>发布时间：</strong>${currentTime}</p>
        </div>
      </div>
    </div>`
  },
  {
    name: '14. 活动通知',
    to: EMAIL,
    subject: `${testData.eventTitle} - Cloud tops 云顶之境`,
    html: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <div style="font-size: 48px; margin-bottom: 15px;">🎉</div>
        <h1 style="color: white; margin: 0; font-size: 28px;">特别活动</h1>
        <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">Cloud tops 云顶之境</p>
      </div>
      <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px;">
        <h2 style="color: #d97706; margin: 0 0 20px 0; font-size: 20px;">${testData.eventTitle}</h2>
        <div style="background: #fffbeb; padding: 25px; border-radius: 12px; margin: 20px 0; border: 2px solid #f59e0b;">
          <p style="color: #374151; font-size: 15px; line-height: 1.8; margin: 0;">${testData.eventContent}</p>
        </div>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 12px;">
          <p style="margin: 0; color: #666; font-size: 13px;"><strong>发布时间：</strong>${currentTime}</p>
        </div>
      </div>
    </div>`
  }
];

async function sendAllEmails() {
  console.log(`开始发送 ${emails.length} 封优化后的邮件...\n`);
  
  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    console.log(`[${i + 1}/${emails.length}] 发送: ${email.name}`);
    
    try {
      const response = await fetch(`${BASE_URL}/api/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email.to,
          subject: email.subject,
          html: email.html
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`  ✅ 发送成功`);
      } else {
        console.log(`  ❌ 发送失败: ${result.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.log(`  ❌ 错误: ${error.message}`);
    }
  }
  
  console.log('\n所有邮件发送完成！');
}

sendAllEmails();