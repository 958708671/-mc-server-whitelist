// 投诉处理定时提醒邮件（简洁版）
const EMAIL = '958708671@qq.com';
const BASE_URL = 'http://localhost:3000';

// 投诉数据
const complaintData = {
  complaintId: 'CMP-20240310-001',
  targetPlayer: '违规玩家小红',
  violationType: '恶意破坏'
};

// 受理管理员信息
const handlerAdmin = {
  adminName: '管理员小刚',
  adminQQ: '987654321'
};

// 提醒时间点
const reminderTimes = [
  { hours: 24, label: '24小时' },
  { hours: 12, label: '12小时' },
  { hours: 6, label: '6小时' },
  { hours: 3, label: '3小时' },
  { hours: 1, label: '1小时' },
  { hours: 0.5, label: '30分钟' }
];

async function sendReminderEmail(label) {
  const urgencyColor = label === '30分钟' || label === '1小时' ? '#dc2626' : label === '3小时' || label === '6小时' ? '#f59e0b' : '#3b82f6';
  
  const subject = `⏰ 投诉处理提醒 - 剩余${label}`;
  
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 500px; margin: 0 auto; background-color: #f8fafc;">
      <div style="background: linear-gradient(135deg, ${urgencyColor} 0%, ${urgencyColor} 100%); padding: 30px 25px; text-align: center; border-radius: 12px 12px 0 0;">
        <div style="font-size: 40px; margin-bottom: 10px;">⏰</div>
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">投诉处理提醒</h1>
        <p style="color: rgba(255,255,255,0.95); margin-top: 8px; font-size: 16px; font-weight: 500;">距离截止还剩 ${label}</p>
      </div>
      
      <div style="background: white; padding: 30px 25px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
          <p style="margin: 0 0 12px 0; color: #374151; font-size: 14px; line-height: 1.6;">
            <strong style="color: #6b7280;">投诉编号：</strong>${complaintData.complaintId}
          </p>
          <p style="margin: 0 0 12px 0; color: #374151; font-size: 14px; line-height: 1.6;">
            <strong style="color: #6b7280;">被举报玩家：</strong>${complaintData.targetPlayer}
          </p>
          <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
            <strong style="color: #6b7280;">违规类型：</strong>${complaintData.violationType}
          </p>
        </div>
        
        <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 13px; line-height: 1.6; text-align: center;">
          请及时登录后台查看详情并完成处理
        </p>
        
        <div style="text-align: center;">
          <a href="http://localhost:3000/admin/complaints" style="display: inline-block; padding: 10px 25px; background: ${urgencyColor}; color: white; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 14px;">前往处理</a>
        </div>
      </div>
    </div>
  `;
  
  try {
    const response = await fetch(`${BASE_URL}/api/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: EMAIL, subject, html })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ 提醒邮件发送成功（剩余${label}）`);
    } else {
      console.log('❌ 发送失败:', result.message);
    }
  } catch (error) {
    console.log('❌ 错误:', error.message);
  }
}

async function sendAllReminders() {
  console.log('开始发送投诉处理提醒邮件...\n');
  console.log('========================================\n');
  
  for (const time of reminderTimes) {
    await sendReminderEmail(time.label);
    console.log('');
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('========================================');
  console.log('所有提醒邮件发送完成！');
}

sendAllReminders();
