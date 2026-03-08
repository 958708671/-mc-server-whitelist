import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface EmailConfig {
  service: 'qq' | 'gmail' | '163' | 'custom';
  host?: string;
  port?: number;
  secure?: boolean;
  user: string;
  pass: string;
}

const getEmailConfig = (): EmailConfig | null => {
  const service = process.env.EMAIL_SERVICE as EmailConfig['service'];
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  
  if (!user || !pass) return null;
  
  return {
    service: service || 'qq',
    user,
    pass
  };
};

const createTransporter = (config: EmailConfig) => {
  const serviceConfigs: Record<string, { host: string; port: number; secure: boolean }> = {
    qq: { host: 'smtp.qq.com', port: 465, secure: true },
    gmail: { host: 'smtp.gmail.com', port: 587, secure: false },
    '163': { host: 'smtp.163.com', port: 465, secure: true }
  };
  
  const serviceConfig = serviceConfigs[config.service] || {
    host: config.host || 'smtp.qq.com',
    port: config.port || 465,
    secure: config.secure !== false
  };
  
  return nodemailer.createTransport({
    host: serviceConfig.host,
    port: serviceConfig.port,
    secure: serviceConfig.secure,
    auth: {
      user: config.user,
      pass: config.pass
    }
  });
};

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { to, subject, html, text } = data;
    
    if (!to || !subject) {
      return NextResponse.json(
        { success: false, message: '缺少收件人或邮件主题' },
        { status: 400 }
      );
    }
    
    const config = getEmailConfig();
    if (!config) {
      console.log('邮件配置未设置，跳过发送邮件');
      return NextResponse.json({
        success: true,
        message: '邮件配置未设置，已跳过发送',
        skipped: true
      });
    }
    
    const transporter = createTransporter(config);
    
    const mailOptions = {
      from: `"Cloud tops 云顶之境" <${config.user}>`,
      to,
      subject,
      text: text || '',
      html: html || text || ''
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('邮件发送成功:', info.messageId);
    
    return NextResponse.json({
      success: true,
      message: '邮件发送成功',
      messageId: info.messageId
    });
    
  } catch (error) {
    console.error('邮件发送失败:', error);
    return NextResponse.json(
      { success: false, message: '邮件发送失败', error: String(error) },
      { status: 500 }
    );
  }
}

export async function sendApplicationApprovedEmail(
  email: string,
  minecraftId: string,
  qqGroup: string,
  downloadUrl: string
) {
  const subject = '🎉 恭喜！您的白名单申请已通过 - Cloud tops 云顶之境';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">🎉 恭喜！</h1>
        <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">您的白名单申请已通过审核</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          亲爱的 <strong>${minecraftId}</strong>，
        </p>
        
        <p style="color: #666; font-size: 14px; line-height: 1.8;">
          恭喜您通过了 Cloud tops 云顶之境服务器的白名单审核！欢迎加入我们的大家庭！
        </p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">📋 接下来请按以下步骤操作：</h3>
          
          <ol style="color: #666; line-height: 2;">
            <li>
              <strong>加入QQ群：</strong>
              <span style="background: #e3f2fd; padding: 5px 10px; border-radius: 4px; color: #1976d2; font-weight: bold;">${qqGroup}</span>
            </li>
            <li>
              <strong>下载客户端整合包：</strong>
              <br>
              <a href="${downloadUrl}" style="color: #1976d2; text-decoration: none;">${downloadUrl}</a>
            </li>
            <li>
              <strong>在QQ群内获取服务器IP地址</strong>
            </li>
            <li>
              <strong>使用您的正版账号登录服务器</strong>
            </li>
          </ol>
        </div>
        
        <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
          <p style="margin: 0; color: #e65100; font-size: 14px;">
            <strong>⚠️ 温馨提示：</strong>
          </p>
          <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #666; font-size: 13px;">
            <li>请使用正版Minecraft客户端登录</li>
            <li>服务器版本为 1.20.4</li>
            <li>如有任何问题，请在QQ群内联系管理员</li>
          </ul>
        </div>
        
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
          此邮件由系统自动发送，请勿直接回复。<br>
          Cloud tops 云顶之境 - 一个纯净的 Minecraft 原版生存社区
        </p>
      </div>
    </div>
  `;
  
  const response = await fetch('/api/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: email, subject, html })
  });
  
  return response.json();
}

export async function sendApplicationRejectedEmail(
  email: string,
  minecraftId: string,
  reason: string
) {
  const subject = '很遗憾，您的白名单申请未通过 - Cloud tops 云顶之境';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">😢 很遗憾</h1>
        <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">您的白名单申请未通过审核</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          亲爱的 <strong>${minecraftId}</strong>，
        </p>
        
        <p style="color: #666; font-size: 14px; line-height: 1.8;">
          很遗憾地通知您，您的 Cloud tops 云顶之境服务器白名单申请未能通过审核。
        </p>
        
        <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
          <p style="margin: 0; color: #e65100; font-size: 14px;">
            <strong>拒绝原因：</strong>
          </p>
          <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
            ${reason || '未提供具体原因'}
          </p>
        </div>
        
        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #1976d2; font-size: 14px;">
            <strong>💡 建议：</strong>
          </p>
          <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #666; font-size: 13px;">
            <li>请检查您填写的信息是否准确完整</li>
            <li>您可以修改申请内容后重新提交</li>
            <li>如有疑问，请联系管理员QQ: 958708671</li>
          </ul>
        </div>
        
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
          此邮件由系统自动发送，请勿直接回复。<br>
          Cloud tops 云顶之境 - 一个纯净的 Minecraft 原版生存社区
        </p>
      </div>
    </div>
  `;
  
  const response = await fetch('/api/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: email, subject, html })
  });
  
  return response.json();
}
