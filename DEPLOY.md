# 部署指南

## ⚠️ 重要说明

这个应用使用了以下**服务端功能**，无法直接在 Netlify 的静态托管上运行：

- **Server Actions**: 登录、数据提交等功能
- **Session 管理**: iron-session 需要服务端环境
- **文件系统数据库**: 使用 JSON 文件存储数据
- **动态路由**: 需要服务端渲染

## 推荐部署方案

### 方案 1: Vercel（推荐）✅

Vercel 是 Next.js 的官方托管平台，完全支持所有功能。

**部署步骤：**

1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 导入你的 GitHub 仓库
4. 添加环境变量：
   ```
   SESSION_PASSWORD=scys2025_super_secure_secret_key_0123456789
   ```
5. 点击 Deploy

### 方案 2: Railway/Render

这些平台支持 Node.js 应用，可以运行完整的 Next.js 功能。

**Railway 部署步骤：**

1. 访问 [railway.app](https://railway.app)
2. 连接 GitHub 仓库
3. 添加环境变量
4. 自动部署

### 方案 3: 自建服务器

在 VPS 或云服务器上部署：

```bash
# 1. 克隆代码
git clone your-repo-url

# 2. 安装依赖
npm install

# 3. 构建应用
npm run build

# 4. 启动应用
npm start
```

## 如果必须使用 Netlify

需要进行**大量改造**：

1. 移除所有 Server Actions
2. 改用客户端状态管理（如 localStorage）
3. 移除文件系统数据库
4. 改为纯静态站点

这样会失去以下功能：
- 用户登录系统
- 数据持久化
- 多用户共享数据
- 照片上传

## 环境变量配置

无论使用哪个平台，都需要设置：

```
SESSION_PASSWORD=scys2025_super_secure_secret_key_0123456789
```

注意：密码必须至少 32 个字符。

## 数据持久化

当前使用 JSON 文件存储，部署到云平台后需要考虑：

1. **Vercel**: 使用外部数据库（如 PostgreSQL、MongoDB）
2. **Railway/Render**: 可以使用持久化存储卷
3. **自建服务器**: 直接使用文件系统

## 建议

**强烈推荐使用 Vercel**，因为：
- 免费额度充足
- 部署简单
- 完美支持 Next.js
- 自动 HTTPS
- 全球 CDN

需要帮助配置 Vercel 部署吗？