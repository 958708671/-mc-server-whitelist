// scripts/update-password.js

// 生成随机密码
function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 20; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// 更新本地配置文件
function updateLocalPassword() {
  try {
    // 生成新密码
    const newPassword = generatePassword();
    console.log('生成的新密码:', newPassword);
    
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
    console.log('\n注意：由于网络限制，无法直接通过API修改Neon控制台密码');
    console.log('当网络恢复后，建议在Neon控制台中手动更新此密码');
    
  } catch (error) {
    console.error('更新密码失败:', error.message);
  }
}

// 执行更新操作
updateLocalPassword();