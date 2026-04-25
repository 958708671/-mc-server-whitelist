# Minecraft 服务器白名单管理系统

一个功能完善的 Minecraft 服务器白名单管理系统，基于 Next.js 16 和 PostgreSQL 构建。

## 系统功能

### 🎯 核心功能
- **白名单申请**：玩家在线提交申请，支持答题验证
- **审核管理**：管理员审核白名单申请，支持批量操作
- **黑名单管理**：管理违规玩家，支持自动解除
- **公告管理**：发布服务器公告，支持富文本编辑
- **活动管理**：创建和管理服务器活动
- **投诉处理**：处理玩家投诉，支持多级审核
- **管理员管理**：服主可管理其他管理员权限

### 🔒 权限控制
- **服主**：拥有所有权限，可管理管理员账户
- **管理员**：可审核申请、管理黑名单、发布公告等
- **普通用户**：可提交申请、查看公告和活动

### 📊 统计与监控
- **数据统计**：申请数量、通过率等数据统计
- **服务器状态**：实时监控服务器状态
- **操作日志**：记录管理员操作日志

### 🎨 用户界面
- **响应式设计**：适配电脑和移动设备
- **现代化界面**：美观的Material Design风格
- **富文本编辑器**：支持图片、视频、表格等内容

## 技术栈

- **前端**：Next.js 16, React, TypeScript
- **后端**：Next.js API Routes, PostgreSQL
- **认证**：JWT-based 会话管理
- **部署**：Vercel

## 快速开始

### 环境要求
- Node.js 18+
- PostgreSQL 14+
- npm 或 yarn

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/958708671/-mc-server-whitelist.git
   cd -mc-server-whitelist
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或
   yarn install
   ```

3. **配置环境变量**
   创建 `.env.local` 文件，填入以下内容：
   ```
   # 数据库连接
   DATABASE_URL=postgresql://username:password@localhost:5432/mc_whitelist

   # 邮件配置
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_password

   # 服务器配置
   SITE_URL=http://localhost:3000
   ADMIN_EMAIL=admin@example.com

   # 认证密钥
   AUTH_SECRET=your_secret_key
   ```

4. **数据库初始化**
   运行 `database/schema.sql` 创建数据库表结构

5. **启动开发服务器**
   ```bash
   npm run dev
   ```

   访问 http://localhost:3000 查看系统

## 部署

推荐使用 Vercel 部署：

1. 连接 GitHub 仓库到 Vercel
2. 在 Vercel 项目设置中配置环境变量
3. 部署完成后，访问生成的域名

## 管理账户

系统初始管理员账户：
- **用户名**：admin
- **密码**：admin123

首次登录后请立即修改密码！

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

---

**服务器愉快！** 🎮
