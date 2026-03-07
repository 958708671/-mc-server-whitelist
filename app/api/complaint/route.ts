import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// 动态导入nodemailer
let transporter: any;

async function getTransporter() {
  if (!transporter) {
    const nodemailer = await import('nodemailer');
    transporter = nodemailer.createTransport({
      host: 'smtp.qq.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
}

// 初始化数据库连接
const sql = neon(process.env.DATABASE_URL || '');

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 构建违规时间字符串
    let violationTime = '未填写';
    if (data.violationYear && data.violationMonth && data.violationDay) {
      violationTime = `${data.violationYear}年${data.violationMonth}月${data.violationDay}日`;
    } else if (data.violationTime) {
      violationTime = data.violationTime;
    }

    // 保存到数据库
    try {
      await sql`
        INSERT INTO complaints (
          reporter_name, 
          reporter_qq, 
          target_player, 
          violation_time, 
          violation_type, 
          description, 
          evidence,
          status,
          created_at
        ) VALUES (
          ${data.reporterName},
          ${data.reporterQQ},
          ${data.targetPlayer},
          ${violationTime},
          ${data.violationType},
          ${data.description},
          ${data.evidence || ''},
          'pending',
          NOW()
        )
      `;
    } catch (dbError) {
      console.error('数据库保存失败:', dbError);
      // 数据库失败不影响邮件发送
    }

    // 构建邮件内容
    const mailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .field { margin-bottom: 15px; padding: 10px; background: white; border-radius: 6px; }
    .field-label { font-weight: bold; color: #374151; margin-bottom: 5px; }
    .field-value { color: #1f2937; }
    .button { 
      display: inline-block; 
      background: #dc2626; 
      color: white; 
      padding: 12px 24px; 
      text-decoration: none; 
      border-radius: 6px; 
      margin-top: 20px;
    }
    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 新的投诉举报</h1>
      <p>CT Cloud tops 云顶之境</p>
    </div>
    <div class="content">
      <div class="field">
        <div class="field-label">举报人昵称</div>
        <div class="field-value">${data.reporterName}</div>
      </div>
      
      <div class="field">
        <div class="field-label">举报人QQ</div>
        <div class="field-value">${data.reporterQQ}</div>
      </div>
      
      <div class="field">
        <div class="field-label">被举报玩家</div>
        <div class="field-value">${data.targetPlayer}</div>
      </div>
      
      <div class="field">
        <div class="field-label">违规时间</div>
        <div class="field-value">${violationTime}</div>
      </div>
      
      <div class="field">
        <div class="field-label">违规类型</div>
        <div class="field-value">${data.violationType}</div>
      </div>
      
      <div class="field">
        <div class="field-label">违规描述</div>
        <div class="field-value">${data.description || '未填写'}</div>
      </div>
      
      <div class="field">
        <div class="field-label">证据截图</div>
        <div class="field-value">${data.evidence || '未上传'}</div>
      </div>
      
      <center>
        <a href="${process.env.SITE_URL || 'http://localhost:3000'}/admin/complaints" class="button">查看投诉列表</a>
      </center>
    </div>
    <div class="footer">
      <p>此邮件由系统自动发送，请勿回复</p>
      <p>CT Cloud tops 云顶之境 管理系统</p>
    </div>
  </div>
</body>
</html>
    `;

    // 发送邮件
    const mailer = await getTransporter();
    await mailer.sendMail({
      from: `"云顶之境投诉系统" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🚨 新的投诉举报 - ${data.targetPlayer}`,
      html: mailContent,
    });

    return NextResponse.json({ 
      success: true, 
      message: '投诉提交成功，管理员已收到通知' 
    });

  } catch (error) {
    console.error('投诉提交失败:', error);
    return NextResponse.json(
      { success: false, message: '提交失败，请稍后重试' },
      { status: 500 }
    );
  }
}
