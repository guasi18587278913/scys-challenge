# SCYS 减脂挑战面板

私密三人减脂挑战平台，用于每日体重打卡、三餐记录和乐捐监督。现已支持 Render 免费套餐部署（持久化磁盘）。

## ✨ 功能总览
- **登录 & 身份**：三位固定成员 + 通用密码，支持 7 天免登录。
- **仪表盘**：今日打卡状态、目标差值、惩罚提示、团队状态卡片。
- **每日记录**：体重、运动时长、运动项目、一日三餐文字、餐食照片、秤面照片。
- **团队日志**：按日期/成员筛选查看所有打卡详情。
- **挑战历史**：阶段目标完成情况、惩罚执行记录。

## 🧱 技术栈
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS 4 自定义主题
- iron-session 管理 Cookie 会话
- 数据持久化：JSON 文件 + 本地图片目录（支持 Render 持久化磁盘）

## 🚀 本地启动
```bash
npm install
npm run dev
```
浏览器访问 http://localhost:3000。

环境变量（`.env`）：
```env
SESSION_PASSWORD="至少32位的随机字符串"
# 本地开发可忽略；部署到 Render 时设置为挂载卷路径（例如 /data）
# DATA_ROOT="/data"
```

## ☁️ Render 免费部署指引
1. **Fork / 推送** 到你自己的 GitHub 仓库。
2. Render 创建新的 **Web Service**，选择该仓库。
3. 在 “Build Command” 使用 `npm install && npm run build`，启动命令 `npm run start`。
4. 在 **Environment** 设置：
   - `SESSION_PASSWORD`：至少 32 位随机字符串
   - `DATA_ROOT`：`/data`
5. 在 **Disks** 中添加 Persistent Disk（1GB 即可），挂载路径 `/data`。
6. 部署完成后，Render 会自动在 `/data` 里生成 `db.json` 和 `uploads/`，数据将持续保存在磁盘上。

> 若访问 `/uploads/...` 时返回 404，请确认 Render 服务的 `DATA_ROOT` 与磁盘挂载路径一致。

## 📁 关键目录
```
scys-challenge/
├─ data/                   # 本地开发的 JSON 数据种子
├─ public/uploads          # 本地开发时保存照片的位置
├─ src/app/uploads         # 动态路由，Render 上读取磁盘中的照片
├─ src/lib/db.ts           # JSON 数据读写（支持 DATA_ROOT）
├─ src/lib/actions/        # Server Actions（保存/删除记录等）
└─ src/app/team-log        # 团队日志页面
```

## ✅ 部署自检
- `npm run lint`
- `npm run build`
- 登录/打卡/查看团队日志/查看照片

## 🔮 后续可扩展
- 上云数据库 + 对象存储（Supabase 或 PlanetScale + S3）
- Webhook / Bot 提醒
- 鼓励 / 点赞等互动机制

欢迎继续迭代，让挑战体验更顺畅。
