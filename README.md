# 🌐 Mays Site - Monorepo

个人网站项目，采用 Monorepo 架构，包含游戏库展示和照片足迹两个独立应用。

## 📁 项目结构

```
mays-site/
├── apps/                   # 应用目录
│   ├── game/              # 游戏库应用 (game.maysssss.cn)
│   └── photo/             # 照片应用 (photo.maysssss.cn)
├── packages/              # 共享代码包
│   └── shared/           # 组件、状态、API 等共享代码
├── workers/              # Cloudflare Workers
│   └── photo-api/       # 照片 API
└── pnpm-workspace.yaml  # pnpm workspace 配置
```

## 🎮 子站点

| 站点      | 域名                | 说明                           |
| --------- | ------------------- | ------------------------------ |
| **Game**  | `game.maysssss.cn`  | Steam 游戏库展示，赛博朋克风格 |
| **Photo** | `photo.maysssss.cn` | 照片与足迹，旅游风格           |

## ✨ 功能特点

### Game 站点

- 📊 Steam 游戏库和游玩统计
- 🎯 游戏时长排行
- 🕐 最近游玩的游戏
- 🎨 赛博朋克 UI 风格

### Photo 站点

- 🗺️ 中国地图足迹可视化
- 📸 照片分组管理
- ☁️ Cloudflare R2 云存储
- 🎨 温暖旅游风格

## 🛠️ 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全
- **Pinia** - 状态管理
- **Vue Router** - 路由管理
- **Vite** - 构建工具
- **pnpm workspace** - Monorepo 管理
- **Cloudflare Workers** - 照片 API
- **GitHub Pages** - 静态托管

## 🚀 本地开发

```bash
# 安装依赖
pnpm install

# 运行游戏应用
pnpm dev:game

# 运行照片应用
pnpm dev:photo

# 构建所有应用
pnpm build

# 单独构建
pnpm build:game
pnpm build:photo
```

## 📦 共享包使用

两个应用通过 `@mays/shared` 共享代码：

```typescript
// 导入共享组件
import { CursorEffect, HeroBackground, GameCard } from "@mays/shared";

// 导入共享状态
import { useSteamStore, usePhotoStore } from "@mays/shared";

// 导入共享 API
import { fetchGroups, authenticate } from "@mays/shared";
```

## 🌐 部署

- Game App 部署到 `game.maysssss.cn`
- Photo App 部署到 `photo.maysssss.cn`
- Photo API 部署到 Cloudflare Workers

## 📄 许可证

MIT License
