import { NextRequest, NextResponse } from 'next/server';
import sql, { withRetry } from '@/lib/db';
import { mockApplications, shouldUseMockDb } from '@/lib/mock-db';
import { notifyAdminsNewApplication } from '@/lib/qq-bot';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const adminId = searchParams.get('adminId');
    const useMockDb = shouldUseMockDb();
    
    let applications;
    if (useMockDb) {
      if (status === 'pending') {
        applications = mockApplications
          .filter(a => a.status === 'pending')
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else if (adminId) {
        applications = mockApplications
          .filter(a => a.reviewed_by_id === parseInt(adminId))
          .sort((a, b) => new Date(b.reviewed_at || b.created_at).getTime() - new Date(a.reviewed_at || a.created_at).getTime())
          .slice(0, 50);
      } else {
        applications = mockApplications
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 100);
      }
    } else {
      applications = await withRetry(async () => {
        if (status === 'pending') {
          return await sql`
            SELECT * FROM whitelist_applications 
            WHERE status = 'pending'
            ORDER BY created_at DESC
          `;
        } else if (adminId) {
          return await sql`
            SELECT * FROM whitelist_applications 
            WHERE reviewed_by_id = ${parseInt(adminId)}
            ORDER BY reviewed_at DESC
            LIMIT 50
          `;
        } else {
          return await sql`
            SELECT * FROM whitelist_applications 
            ORDER BY created_at DESC
            LIMIT 100
          `;
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('获取申请列表失败:', error);
    return NextResponse.json(
      { success: false, message: '获取申请列表失败，请稍后重试' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { minecraft_id, age, contact, reason, quiz_category, quiz_score, quiz_total, 
            play_time, favorite_mode, server_experience, gender, country, 
            how_found, discord_id, play_style, griefing_history, additional_info } = data;
    
    if (!minecraft_id || !contact) {
      return NextResponse.json(
        { success: false, message: '游戏ID和联系方式为必填项' },
        { status: 400 }
      );
    }
    
    const existing = await sql`
      SELECT id FROM whitelist_applications 
      WHERE minecraft_id = ${minecraft_id} AND status = 'pending'
    `;
    
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: '您已有待审核的申请，请等待管理员处理' },
        { status: 400 }
      );
    }
    
    // 使用重试机制执行插入操作
    await withRetry(async () => {
      await sql`
        INSERT INTO whitelist_applications (
          minecraft_id, age, contact, reason, 
          quiz_category, quiz_score, quiz_total, 
          play_time, favorite_mode, server_experience, 
          gender, country, 
          how_found, discord_id, 
          play_style, griefing_history, 
          additional_info, 
          status
        ) VALUES (
          ${minecraft_id}, ${age || null}, ${contact}, ${reason || ''}, 
          ${quiz_category || ''}, ${quiz_score || 0}, ${quiz_total || 0}, 
          ${play_time || 0}, ${favorite_mode || ''}, ${server_experience || ''}, 
          ${gender || ''}, ${country || ''}, 
          ${how_found || ''}, ${discord_id || ''}, 
          ${play_style || ''}, ${griefing_history || ''}, 
          ${additional_info || ''}, 
          'pending'
        )
      `;
    });
    
    // 发送邮件通知给启用了申请邮件通知的管理员
    try {
      // 查询所有启用了申请邮件通知的管理员
      const adminsToNotify = await withRetry(async () => {
        return await sql`
          SELECT qq FROM admins 
          WHERE receive_application_email = TRUE AND qq IS NOT NULL AND qq != ''
        `;
      });
      
      if (adminsToNotify.length > 0) {
        const mailer = await getTransporter();
        
        // 构建邮件内容
        const mailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .field { margin-bottom: 15px; padding: 10px; background: white; border-radius: 6px; }
    .field-label { font-weight: bold; color: #374151; margin-bottom: 5px; }
    .field-value { color: #1f2937; }
    .button { 
      display: inline-block; 
      background: #10b981; 
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
      <h1>📝 新的白名单申请</h1>
      <p>CT Cloud tops 云顶之境</p>
    </div>
    <div class="content">
      <div class="field">
        <div class="field-label">游戏ID</div>
        <div class="field-value">${minecraft_id}</div>
      </div>
      
      <div class="field">
        <div class="field-label">年龄</div>
        <div class="field-value">${age || '未填写'}</div>
      </div>
      
      <div class="field">
        <div class="field-label">联系方式</div>
        <div class="field-value">${contact}</div>
      </div>
      
      <div class="field">
        <div class="field-label">申请理由</div>
        <div class="field-value">${reason || '未填写'}</div>
      </div>
      
      <div class="field">
        <div class="field-label">游戏经验</div>
        <div class="field-value">${play_time || 0} 个月 | ${favorite_mode || '未填写'}</div>
      </div>
      
      <div class="field">
        <div class="field-label">服务器经验</div>
        <div class="field-value">${server_experience || '未填写'}</div>
      </div>
      
      <div class="field">
        <div class="field-label">个人信息</div>
        <div class="field-value">${gender || '未填写'} | ${country || '未填写'}</div>
      </div>
      
      <div class="field">
        <div class="field-label">社区相关</div>
        <div class="field-value">${how_found || '未填写'}</div>
      </div>
      
      <div class="field">
        <div class="field-label">Discord ID</div>
        <div class="field-value">${discord_id || '未填写'}</div>
      </div>
      
      <div class="field">
        <div class="field-label">游戏风格</div>
        <div class="field-value">${play_style || '未填写'} | ${griefing_history || '未填写'}</div>
      </div>
      
      <div class="field">
        <div class="field-label">其他信息</div>
        <div class="field-value">${additional_info || '未填写'}</div>
      </div>
      
      <center>
        <a href="${process.env.SITE_URL || 'http://localhost:3000'}/admin/applications" class="button">查看申请列表</a>
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
        
        // 发送邮件给所有启用的管理员
        for (const admin of adminsToNotify) {
          const adminEmail = `${admin.qq}@qq.com`;
          try {
            await mailer.sendMail({
              from: `"云顶之境白名单系统" <${process.env.EMAIL_USER}>`,
              to: adminEmail,
              subject: `📝 新的白名单申请 - ${minecraft_id}`,
              html: mailContent,
            });
            console.log(`申请邮件已发送给: ${adminEmail}`);
          } catch (emailError) {
            console.error(`发送邮件给 ${adminEmail} 失败:`, emailError);
          }
        }
        
        // 同时发送给默认管理员邮箱（如果设置了）
        if (process.env.ADMIN_EMAIL) {
          try {
            await mailer.sendMail({
              from: `"云顶之境白名单系统" <${process.env.EMAIL_USER}>`,
              to: process.env.ADMIN_EMAIL,
              subject: `📝 新的白名单申请 - ${minecraft_id}`,
              html: mailContent,
            });
            console.log(`申请邮件已发送给默认管理员: ${process.env.ADMIN_EMAIL}`);
          } catch (emailError) {
            console.error(`发送邮件给默认管理员失败:`, emailError);
          }
        }
        
        console.log('白名单申请邮件发送完成');
      } else {
        console.log('没有管理员启用了申请邮件通知');
      }
    } catch (mailError) {
      console.error('发送申请邮件失败:', mailError);
      // 邮件失败不影响整个请求的成功
    }
    
    // 通知管理员有新的白名单申请（QQ机器人）
    try {
      await notifyAdminsNewApplication(minecraft_id, contact, age);
      console.log('QQ机器人通知管理员成功');
    } catch (qqError) {
      console.error('QQ机器人通知失败:', qqError);
      // QQ通知失败不影响整个请求的成功
    }
    
    return NextResponse.json({
      success: true,
      message: '申请提交成功'
    });
  } catch (error) {
    console.error('提交申请失败:', error);
    return NextResponse.json(
      { success: false, message: '提交申请失败' },
      { status: 500 }
    );
  }
}
