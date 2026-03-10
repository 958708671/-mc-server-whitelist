const net = require('net');

const args = process.argv.slice(2);
const host = args[0] || '127.0.0.1';
const port = parseInt(args[1]) || 25575;
const password = args[2] || '';
const command = args[3] || '';

function createPacket(id, type, body) {
  const bodyBuffer = Buffer.from(body, 'utf8');
  const packet = Buffer.alloc(14 + bodyBuffer.length);
  packet.writeInt32LE(10 + bodyBuffer.length, 0);
  packet.writeInt32LE(id, 4);
  packet.writeInt32LE(type, 8);
  bodyBuffer.copy(packet, 12);
  packet.writeInt8(0, 12 + bodyBuffer.length);
  packet.writeInt8(0, 13 + bodyBuffer.length);
  return packet;
}

function parsePacket(data) {
  if (data.length < 14) throw new Error('数据包不完整');
  const length = data.readInt32LE(0);
  return {
    id: data.readInt32LE(4),
    type: data.readInt32LE(8),
    body: data.slice(12, 12 + length - 10).toString('utf8')
  };
}

const client = new net.Socket();
let requestId = 0;
let responseData = Buffer.alloc(0);
let authenticated = false;

client.connect(port, host, () => {
  const authId = requestId++;
  const authPacket = createPacket(authId, 3, password);
  client.write(authPacket);
});

client.on('data', (data) => {
  responseData = Buffer.concat([responseData, data]);
  try {
    const response = parsePacket(responseData);
    if (!authenticated) {
      if (response.id !== -1) {
        authenticated = true;
        const cmdId = requestId++;
        const cmdPacket = createPacket(cmdId, 2, command);
        client.write(cmdPacket);
      } else {
        console.log(JSON.stringify({ success: false, message: '认证失败：密码错误' }));
        client.destroy();
        process.exit(1);
      }
    } else {
      console.log(JSON.stringify({ success: true, message: response.body }));
      client.destroy();
      process.exit(0);
    }
    responseData = Buffer.alloc(0);
  } catch (e) {}
});

client.on('error', (err) => {
  console.log(JSON.stringify({ success: false, message: `连接错误: ${err.message}` }));
  process.exit(1);
});

client.on('close', () => {
  if (!authenticated) {
    console.log(JSON.stringify({ success: false, message: '连接已关闭' }));
  }
});
