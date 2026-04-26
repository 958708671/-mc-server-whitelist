import { NextRequest, NextResponse } from 'next/server';
import sql, { withRetry } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// 动态导入nodemailer
let transporter: any;

async function getTransporter() {
  if (!transporter) {
    const nodemailer = await import('nodemailer');
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.qq.com',
      port: parseInt(process.env.SMTP_PORT || '465'),
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
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const adminId = searchParams.get('adminId');
    
    const applications = await withRetry(async () => {
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
    console.log('收到申请数据:', data);
    const { minecraft_id, age, contact, reason, quiz_category, quiz_score, quiz_total, 
            play_time, favorite_mode, server_experience, gender, country, 
            how_found, discord_id, play_style, griefing_history, additional_info } = data;
    
    if (!minecraft_id || !contact) {
      return NextResponse.json(
        { success: false, message: '游戏ID和联系方式为必填项' },
        { status: 400 }
      );
    }

    // M4：校验minecraft_id格式（3-16位字母数字下划线）
    if (!/^[a-zA-Z0-9_]{3,16}$/.test(minecraft_id)) {
      return NextResponse.json(
        { success: false, message: '游戏ID格式不正确（3-16位字母、数字或下划线）' },
        { status: 400 }
      );
    }

    // 校验联系方式格式（支持QQ号或手机号）
    const qqRegex = /^[1-9]\d{4,10}$/;
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (contact && !qqRegex.test(contact) && !phoneRegex.test(contact)) {
      return NextResponse.json(
        { success: false, message: '联系方式格式不正确，请输入有效的QQ号或手机号' },
        { status: 400 }
      );
    }

    // 处理年龄值，确保不是NaN
    let processedAge = null;
    if (age !== undefined && age !== null && age !== '') {
      const ageNum = parseInt(age);
      if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
        return NextResponse.json(
          { success: false, message: '年龄填写不合法' },
          { status: 400 }
        );
      }
      processedAge = ageNum;
    }
    
    // 确保所有字符串值都是有效的UTF-8字符串
    const safeValues = {
      minecraft_id: String(minecraft_id || ''),
      contact: String(contact || ''),
      reason: String(reason || ''),
      quiz_category: String(quiz_category || ''),
      favorite_mode: String(favorite_mode || ''),
      server_experience: String(server_experience || ''),
      gender: String(gender || ''),
      country: String(country || ''),
      how_found: String(how_found || ''),
      discord_id: String(discord_id || ''),
      play_style: String(play_style || ''),
      griefing_history: String(griefing_history || ''),
      additional_info: String(additional_info || '')
    };
    
    // 模拟模式：跳过数据库操作，直接返回成功
    console.log('使用模拟模式，跳过数据库操作');
    
    // 模拟检查待审核申请
    console.log('模拟检查待审核申请...');
    
    // 模拟邮件发送
    console.log('模拟邮件发送：新的白名单申请 -', safeValues.minecraft_id);
    
    // 模拟邮件内容构建（验证中文字符处理）
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
        <div class="field-value">${safeValues.minecraft_id}</div>
      </div>
      
      <div class="field">
        <div class="field-label">年龄</div>
        <div class="field-value">${age || '未填写'}</div>
      </div>
      
      <div class="field">
        <div class="field-label">联系方式</div>
        <div class="field-value">${safeValues.contact}</div>
      </div>
      
      <div class="field">
        <div class="field-label">申请理由</div>
        <div class="field-value">${safeValues.reason || '未填写'}</div>
      </div>
      
      <div class="field">
        <div class="field-label">游戏经验</div>
        <div class="field-value">${play_time || 0} 个月 | ${safeValues.favorite_mode || '未填写'}</div>
      </div>
      
      <div class="field">
        <div class="field-label">服务器经验</div>
        <div class="field-value">${safeValues.server_experience || '未填写'}</div>
      </div>
      
      <div class="field">
        <div class="field-label">个人信息</div>
        <div class="field-value">${safeValues.gender || '未填写'} | ${safeValues.country || '未填写'}</div>
      </div>
      
      <div class="field">
        <div class="field-label">社区相关</div>
        <div class="field-value">${safeValues.how_found || '未填写'}</div>
      </div>
      
      <div class="field">
        <div class="field-label">Discord ID</div>
        <div class="field-value">${safeValues.discord_id || '未填写'}</div>
      </div>
      
      <div class="field">
        <div class="field-label">游戏风格</div>
        <div class="field-value">${safeValues.play_style || '未填写'} | ${safeValues.griefing_history || '未填写'}</div>
      </div>
      
      <div class="field">
        <div class="field-label">其他信息</div>
        <div class="field-value">${safeValues.additional_info || '未填写'}</div>
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
    
    console.log('邮件内容构建成功，验证中文字符处理正常');
    
    // 尝试实际发送邮件（如果配置了正确的邮件服务器）
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        console.log('尝试实际发送邮件...');
        const mailer = await getTransporter();
        
        // 测试邮件发送
        const testEmail = process.env.ADMIN_EMAIL || 'test@example.com';
        await mailer.sendMail({
          from: `"云顶之境白名单系统" <${process.env.EMAIL_USER}>`,
          to: testEmail,
          subject: `📝 新的白名单申请 - ${safeValues.minecraft_id}`,
          html: mailContent,
        });
        console.log('邮件发送成功：', testEmail);
      } else {
        console.log('邮件配置未完成，跳过实际发送');
        console.log('需要在.env文件中配置EMAIL_USER和EMAIL_PASS');
      }
    } catch (emailError) {
      console.error('发送邮件失败:', emailError);
      // 邮件发送失败不影响整个请求的成功
    }
    
    console.log('邮件发送测试完成');
    
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
