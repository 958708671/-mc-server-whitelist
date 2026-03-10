// scripts/change-neon-password.js

// Neon API配置
const API_KEY = 'napi_ujopocbbko6onfd5gq47wo4duabifw36bpb500e1e3w4irlfg7ds2x6kj0ke66g8';
const PROJECT_ID = 'ep-autumn-frog-a15r2a2l'; // 从连接字符串中提取
const BRANCH_ID = 'main'; // 通常是main分支

// 生成随机密码
function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 20; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function changePassword() {
  try {
    // 生成新密码
    const newPassword = generatePassword();
    console.log('生成的新密码:', newPassword);
    
    // 调用Neon API修改密码
    const response = await fetch(`https://console.neon.tech/api/v2/projects/${PROJECT_ID}/branches/${BRANCH_ID}/endpoints`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'writer',
        password: newPassword
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    console.log('密码修改成功:', data);
    
    // 更新本地配置文件
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '..', '.env.local');
    
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      // 替换密码部分
      envContent = envContent.replace(/DATABASE_URL=postgresql:\/\/neondb_owner:[^@]+@/g, `DATABASE_URL=postgresql://neondb_owner:${newPassword}@`);
      fs.writeFileSync(envPath, envContent);
      console.log('本地配置文件已更新');
    } else {
      console.error('未找到.env.local文件');
    }

    console.log('\n=== 操作完成 ===');
    console.log('新的数据库密码:', newPassword);
    console.log('请保存此密码，以备后续使用');
    
  } catch (error) {
    console.error('修改密码失败:', error.message);
  }
}

// 执行修改密码操作
changePassword();