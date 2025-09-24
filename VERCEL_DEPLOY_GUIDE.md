# Vercel 部署指南

## 📋 部署步骤

### 步骤 1：准备 GitHub 仓库

1. 将代码提交到 GitHub：
```bash
git add .
git commit -m "准备 Vercel 部署"
git push origin main
```

### 步骤 2：注册/登录 Vercel

1. 访问 [vercel.com](https://vercel.com)
2. 点击 "Sign Up" 或 "Log In"
3. 选择 "Continue with GitHub" 使用 GitHub 账号登录

### 步骤 3：导入项目

1. 登录后点击 "Add New..." → "Project"
2. 点击 "Import Git Repository"
3. 选择你的 `scys-challenge` 仓库
4. 点击 "Import"

### 步骤 4：配置环境变量

在 "Environment Variables" 部分添加：

| 变量名 | 值 |
|--------|-----|
| SESSION_PASSWORD | scys2025_super_secure_secret_key_0123456789 |

⚠️ **重要**：SESSION_PASSWORD 必须至少 32 个字符

### 步骤 5：部署设置

保持默认设置即可：
- Framework Preset: Next.js（自动检测）
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### 步骤 6：点击 Deploy

点击 "Deploy" 按钮，等待 2-3 分钟即可完成部署。

## 🎉 部署完成

部署成功后，你会获得：
- 生产环境 URL：`https://你的项目名.vercel.app`
- 自动 HTTPS 证书
- 全球 CDN 加速

## ⚠️ 重要提醒

### 数据存储问题

当前版本使用 JSON 文件存储数据，在 Vercel 上会有以下限制：
- **数据不会持久化**：每次部署后数据会重置
- **只读文件系统**：无法保存新的记录

### 解决方案

如需数据持久化，有以下选择：

1. **使用 Vercel KV**（推荐）
   - 在 Vercel 控制台启用 KV Storage
   - 免费额度：每天 3000 次请求

2. **使用外部数据库**
   - MongoDB Atlas（免费 512MB）
   - Supabase PostgreSQL（免费 500MB）

3. **保持演示模式**
   - 仅作为展示使用
   - 每次部署重置数据

## 🔧 后续优化

### 自定义域名

1. 在 Vercel 控制台进入项目
2. 点击 "Settings" → "Domains"
3. 添加你的域名
4. 按提示配置 DNS

### 性能监控

Vercel 自动提供：
- Analytics（访问分析）
- Speed Insights（性能监控）
- Web Vitals（核心指标）

## 💡 常见问题

### Q: 部署失败怎么办？
A: 查看 Vercel 控制台的构建日志，通常是环境变量未设置。

### Q: 如何更新部署？
A: 推送代码到 GitHub 主分支，Vercel 会自动重新部署。

### Q: 如何查看日志？
A: 在 Vercel 控制台点击 "Functions" → "Logs"

## 📞 需要帮助？

如遇到问题，可以：
1. 查看 [Vercel 文档](https://vercel.com/docs)
2. 检查构建日志
3. 确认环境变量已正确设置

---

**祝部署顺利！** 🚀