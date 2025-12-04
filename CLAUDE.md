# CLAUDE.md

本文档为 Claude Code (claude.ai/code) 在此仓库中工作提供指导。

## 🚀 常用命令

### 开发
```bash
# 启动开发服务器 (Vite)
npm run dev

# 构建生产版本
npm run build

# 本地预览生产构建
npm run preview
```

### 数据管理
```bash
# 获取最新 Steam 数据（需要 STEAM_API_KEY 和 STEAM_ID 环境变量）
node scripts/fetch-steam-data.js

# 获取城市坐标数据（用于照片模块）
node scripts/fetch-city-coordinates.js
```

### Cloudflare Workers (照片 API)
```bash
# 部署 photo-api worker
cd workers/photo-api && npx wrangler deploy

# Worker 本地开发
cd workers/photo-api && npx wrangler dev
```

## 📦 技术栈

- **前端**: Vue 3 (Composition API) + TypeScript
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **构建工具**: Vite
- **图表**: ECharts + vue-echarts
- **后端**: Cloudflare Workers（使用 R2 存储照片）
- **部署**: GitHub Pages（通过 GitHub Actions）
- **数据源**: Steam Web API

## 🏗️ 项目架构

### 前端 (Vue 3 SPA)
位于 `/src`，应用使用：
- **Pinia 状态管理**:
  - `stores/steam.ts` - Steam 游戏数据、玩家统计、游戏库
  - `stores/photos.ts` - 照片分组、位置信息、localStorage 持久化
- **页面视图** (`/src/views`):
  - `Home/` - 精选游戏和统计概览
  - `Games/` - 完整游戏库（含筛选）
  - `Photos/` - 中国地图可视化与照片分组
  - `About/` - 个人介绍页面
- **按功能组织的组件**:
  - `components/common/` - 可复用 UI 组件
  - `components/game/` - 游戏相关组件
  - `components/photos/` - 照片模块组件
- **路由** (`/src/router/index.ts`) - SPA 路由，4 个主要页面

### 后端 (Cloudflare Workers)
位于 `/workers/photo-api`:
- **R2 存储** 用于照片文件
- **JWT 认证**（7 天令牌过期）
- **API 端点**:
  - `POST /api/auth` - 认证并获取令牌
  - `GET /api/groups` - 获取照片分组元数据
  - `POST /api/groups` - 保存照片分组元数据
  - `POST /api/upload` - 上传照片到 R2
  - `GET /api/image/:key` - 获取照片
  - `DELETE /api/image/:key` - 删除照片
- **Wrangler 配置** (`wrangler.toml`):
  - R2 存储桶绑定: `PHOTO_BUCKET` → `my-photos`
  - 环境变量通过 `wrangler secret put` 设置
  - CORS 配置特定来源

### 数据流

**Steam 数据**:
1. GitHub Actions 每天 2:00 UTC 运行 `scripts/fetch-steam-data.js`
2. 使用 GitHub Secrets 中的凭证从 Steam Web API 获取
3. 保存到 `public/data/steam-games.json`
4. 在应用中通过 `import.meta.env.BASE_URL + '/data/steam-games.json'` 加载
5. 存储在 `steam.ts` Pinia store 中

**照片数据**:
1. 存储在浏览器 localStorage（键: `mays_photo_groups`）
2. 可选：与 Cloudflare Worker API 同步持久化存储
3. 照片文件通过 Worker API 上传到 R2 存储桶

## 📁 关键文件与目录

- `vite.config.ts` - Vite 配置，包含 `@` 别名指向 `/src`
- `public/data/steam-games.json` - Steam 数据（由 GitHub Actions 自动生成）
- `public/data/china-geojson.json` - ECharts 中国地图地理数据
- `public/404.html` - GitHub Pages SPA 回退页
- `scripts/fetch-steam-data.js` - Steam API 数据获取脚本
- `.github/workflows/deploy.yml` - GitHub Actions 部署工作流

## 🌐 部署

**GitHub Pages**（自动部署）:
1. 推送到 `main` 分支触发工作流
2. 工作流获取最新 Steam 数据
3. 构建 Vue 应用 (`npm run build`)
4. 部署到 GitHub Pages
5. 每天 2:00 UTC 自动更新（北京时间 10:00）

**配置**:
- `vite.config.ts:17` - `base: "/"` 用于 GitHub Pages（如部署到 user.github.io 需要更新）
- 需要的 GitHub Secrets: `STEAM_API_KEY`, `STEAM_ID`

## 🎨 样式与 UI

- **设计主题**: 毛玻璃效果（明亮主题，渐变和模糊效果）
- **色彩**: Steam 蓝色 (#66c0f4) + 紫色渐变
- **深色背景**: #0d1117, #161b22
- **CSS**: 组件内作用域样式，全局样式在 `/src/style.css`
- **光标**: 自定义光标效果 (`components/common/CursorEffect.vue`)

## 💾 数据存储

**Steam 游戏**: JSON 文件在 `public/data/`（通过 GitHub Actions 自动更新）
**照片**:
- 元数据: localStorage (`mays_photo_groups`)
- 图片: 通过 Cloudflare Worker API 上传到 R2 存储桶
- 城市坐标: `scripts/fetch-city-coordinates.js` 输出

## 🔧 环境设置

**必需环境变量**（脚本使用）:
- `STEAM_API_KEY` - Steam Web API 密钥
- `STEAM_ID` - 你的 Steam ID

**Cloudflare Worker Secrets**（通过 `wrangler secret put` 设置）:
- `AUTH_PASSWORD` - 照片 API 密码
- `JWT_SECRET` - JWT 令牌签名密钥（可选，默认使用 AUTH_PASSWORD + 后缀）
- `CORS_ORIGIN` - 允许的来源（在 wrangler.toml vars 中设置）

## 📊 关键 TypeScript 类型

查看 `/src/types/steam.ts`:
- `SteamGame` - Steam API 的单个游戏数据
- `GameData` - 带有图片 URL 的扩展游戏数据
- `SteamPlayerSummary` - 玩家档案信息
- `GameStats` - 用于显示的计算统计

## 🗺️ 照片模块功能

- **中国地图**: 交互式 ECharts 地图，包含 35+ 城市
- **城市选择器**: 可搜索的城市选择器，含坐标数据
- **照片分组**: 按城市/位置组织照片
- **上传**: 拖拽上传，支持图片压缩
- **持久化**: localStorage 存储元数据，可选 R2 存储图片
- **地图可视化**: 真实 GeoJSON 边界，可点击区域

## 🔒 安全注意事项

- Steam API 凭证存储在 GitHub Secrets 中
- 照片 API 使用基于密码的认证和 JWT 令牌
- CORS 限制为特定来源（localhost + 生产域名）
- 客户端代码中不包含敏感数据

## 🐛 已知问题与解决方案

- **SPA 404**: 通过 `public/404.html` 修复 GitHub Pages 问题
- **数据加载路径**: 使用 `import.meta.env.BASE_URL` 确保 GitHub Pages 兼容性
- **地图溢出**: ECharts 工具提示 confined，标签布局优化
- **CORS**: Worker 处理预检 OPTIONS 请求

## 📝 开发说明

- 启用 TypeScript 严格模式
- 全面使用 Vue 3 Composition API
- ESLint/Prettier: 查看现有配置文件
- 开发模式启用热更新
- 基于路由的代码分割（动态导入）
- 中国地图异步加载 GeoJSON（在 `ChinaMap.vue` 中处理）

---

更多信息查看:
- `README.md` - 项目概述和快速开始
- `DEVELOPMENT.md` - 详细开发计划和进度
