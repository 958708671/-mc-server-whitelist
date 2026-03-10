const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function generateOfflineUUID(username) {
  const data = Buffer.from('OfflinePlayer:' + username, 'utf8');
  const hash = crypto.createHash('md5').update(data).digest();
  
  hash[6] = (hash[6] & 0x0f) | 0x30;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  
  return hash.toString('hex').replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
}

const whitelistPath = path.join(__dirname, '..', '..', '服务器1', 'whitelist.json');
const playerName = 'yan_hong_jun';

console.log(`正在为玩家 ${playerName} 生成正确的离线 UUID...`);
const correctUUID = generateOfflineUUID(playerName);
console.log(`正确的 UUID: ${correctUUID}`);

const whitelist = JSON.parse(fs.readFileSync(whitelistPath, 'utf8'));

const existingIndex = whitelist.findIndex(p => p.name === playerName);
if (existingIndex !== -1) {
  whitelist[existingIndex].uuid = correctUUID;
  console.log(`已更新白名单中的 UUID`);
} else {
  whitelist.push({ uuid: correctUUID, name: playerName });
  console.log(`已添加到白名单`);
}

fs.writeFileSync(whitelistPath, JSON.stringify(whitelist, null, 2));
console.log(`白名单已保存到 ${whitelistPath}`);
console.log('\n现在请重启 Minecraft 服务器或使用 /whitelist reload 命令重新加载白名单');
