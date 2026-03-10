import { NextResponse } from 'next/server';
import { createSocket, Socket } from 'net';

interface RconOptions {
  host: string;
  port: number;
  password: string;
}

class Rcon {
  private socket: Socket | null = null;
  private host: string;
  private port: number;
  private password: string;
  private connected: boolean = false;
  private authenticated: boolean = false;
  private requestId: number = 0;

  constructor(options: RconOptions) {
    this.host = options.host;
    this.port = options.port;
    this.password = options.password;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = createSocket('tcp');
      
      const timeout = setTimeout(() => {
        this.socket?.destroy();
        reject(new Error('连接超时'));
      }, 5000);

      this.socket.connect(this.port, this.host, () => {
        clearTimeout(timeout);
        this.connected = true;
        resolve();
      });

      this.socket.on('error', (err) => {
        clearTimeout(timeout);
        reject(new Error(`连接错误: ${err.message}`));
      });

      this.socket.on('close', () => {
        this.connected = false;
        this.authenticated = false;
      });
    });
  }

  async authenticate(): Promise<void> {
    if (!this.connected || !this.socket) {
      throw new Error('未连接到服务器');
    }

    return new Promise((resolve, reject) => {
      const authId = this.requestId++;
      const packet = this.createPacket(authId, 3, this.password);

      const timeout = setTimeout(() => {
        reject(new Error('认证超时'));
      }, 5000);

      const onData = (data: Buffer) => {
        clearTimeout(timeout);
        this.socket?.off('data', onData);
        
        const response = this.parsePacket(data);
        if (response.id === authId) {
          this.authenticated = true;
          resolve();
        } else {
          reject(new Error('认证失败: 密码错误'));
        }
      };

      this.socket.on('data', onData);
      this.socket.write(packet);
    });
  }

  async sendCommand(command: string): Promise<string> {
    if (!this.connected || !this.authenticated || !this.socket) {
      throw new Error('未连接或未认证');
    }

    return new Promise((resolve, reject) => {
      const commandId = this.requestId++;
      const packet = this.createPacket(commandId, 2, command);

      const timeout = setTimeout(() => {
        reject(new Error('命令执行超时'));
      }, 10000);

      let responseData = Buffer.alloc(0);

      const onData = (data: Buffer) => {
        responseData = Buffer.concat([responseData, data]);
        
        try {
          const response = this.parsePacket(responseData);
          clearTimeout(timeout);
          this.socket?.off('data', onData);
          resolve(response.body);
        } catch {
          // 数据不完整，继续等待
        }
      };

      this.socket.on('data', onData);
      this.socket.write(packet);
    });
  }

  private createPacket(id: number, type: number, body: string): Buffer {
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

  private parsePacket(data: Buffer): { id: number; type: number; body: string } {
    if (data.length < 14) {
      throw new Error('数据包不完整');
    }

    const length = data.readInt32LE(0);
    if (data.length < 4 + length) {
      throw new Error('数据包不完整');
    }

    return {
      id: data.readInt32LE(4),
      type: data.readInt32LE(8),
      body: data.slice(12, 12 + length - 10).toString('utf8')
    };
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
      this.connected = false;
      this.authenticated = false;
    }
  }
}

export async function GET() {
  const rconHost = process.env.RCON_HOST || '127.0.0.1';
  const rconPort = parseInt(process.env.RCON_PORT || '25575');
  const rconPassword = process.env.RCON_PASSWORD || 'cloudtops2024';

  const rcon = new Rcon({ host: rconHost, port: rconPort, password: rconPassword });
  
  try {
    await rcon.connect();
    await rcon.authenticate();
    
    const versionResponse = await rcon.sendCommand('version');
    
    rcon.disconnect();
    
    let version = 'Unknown';
    let serverType = 'Unknown';
    
    if (versionResponse) {
      const versionMatch = versionResponse.match(/(\d+\.\d+(?:\.\d+)?)/);
      if (versionMatch) {
        version = versionMatch[1];
      }
      
      if (versionResponse.toLowerCase().includes('fabric')) {
        serverType = 'Fabric';
      } else if (versionResponse.toLowerCase().includes('forge')) {
        serverType = 'Forge';
      } else if (versionResponse.toLowerCase().includes('paper')) {
        serverType = 'Paper';
      } else if (versionResponse.toLowerCase().includes('spigot')) {
        serverType = 'Spigot';
      } else if (versionResponse.toLowerCase().includes('bukkit')) {
        serverType = 'Bukkit';
      } else if (versionResponse.toLowerCase().includes('vanilla')) {
        serverType = 'Vanilla';
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        version,
        serverType,
        rawResponse: versionResponse
      }
    });
  } catch (error: any) {
    rcon.disconnect();
    return NextResponse.json({
      success: false,
      message: `获取服务器版本失败: ${error.message}`,
      data: {
        version: 'Unknown',
        serverType: 'Unknown'
      }
    });
  }
}
