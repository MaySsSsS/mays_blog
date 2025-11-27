# Mays Space - 个人博客项目开发计划

> 一个集成了 **个人博客 + 游戏主页 + 照片足迹** 的综合性个人空间

## 📋 项目概述

将原本的纯 Steam 游戏展示站点，改造成一个更有"玩家感"的个人博客，包含：

- 🎮 游戏模块：展示 Steam 游戏库、最爱游戏、游戏时长统计
- 📷 照片模块：按地理位置分组的旅行/日常照片，支持中国地图可视化
- 👤 关于我：个人介绍页面

---

## ✅ 已完成

### 1. 项目基础架构

- [x] Vue 3 + TypeScript + Pinia + Vue Router 项目搭建
- [x] Steam API 数据获取脚本（ES Module 格式）
- [x] GitHub Actions 自动化部署配置
- [x] 响应式布局和暗色主题

### 2. 游戏模块

- [x] Steam 数据 Store（`stores/steam.ts`）
- [x] 游戏卡片组件（`components/game/GameCard.vue`）
- [x] 游戏库页面（`views/Games/index.vue`）
- [x] 首页游戏统计展示

### 3. 首页改造

- [x] 动态游戏封面背景组件（`components/common/HeroBackground.vue`）
  - 轮播展示最常玩的游戏封面（CS2、Apex、赛博朋克 2077、空洞骑士等）
  - 浮动游戏元素装饰动画
- [x] 精选游戏卡片组件（`components/common/FeaturedGame.vue`）
  - 显示游戏时长、最后游玩时间
  - 时长进度条可视化
- [x] 首页布局调整，添加"最爱游戏精选"区域

### 4. 照片模块基础

- [x] 照片 Store（`stores/photos.ts`）
  - 分组管理（增删改）
  - 照片管理（增删）
  - localStorage 持久化
  - 中国 35+ 主要城市坐标数据
- [x] 照片页面基础结构（`views/Photos/index.vue`）
  - 分组列表侧边栏
  - 城市标签筛选
  - 简易中国地图（点位显示）
  - 照片网格展示

### 5. 导航和品牌调整

- [x] 导航栏增加"照片·足迹"入口
- [x] 品牌从"Gaming Journey"改为"Mays Space"
- [x] 页脚文案调整为"Personal blog · Games · Photos"
- [x] 路由配置更新

---

## 🚧 进行中 / 待完成

### 照片模块增强

- [x] **完整中国地图 SVG**
  - 使用真实的中国地图轮廓
  - 省份/城市可点击高亮
  - 已去过的城市特殊标记
- [x] **城市选择器弹窗**
  - 可视化选择城市（点击地图或搜索）
  - 支持添加自定义位置
- [x] **照片上传功能**

  - 支持拖拽上传
  - 图片压缩和预览
  - 存储方案：Base64 存储到 localStorage

- [x] **照片详情弹窗**
  - 大图预览
  - 照片轮播
  - 键盘导航支持
  - 下载和删除功能

### 首页继续优化

- [x] 添加"最近动态"区域（游戏 + 照片混合）
- [ ] 个人简介卡片
- [ ] 社交链接（GitHub、Steam 等）

### 关于页面

- [ ] 个人介绍完善
- [ ] 技能/兴趣标签
- [ ] 时间线（可选）

### 其他功能

- [ ] 深色/浅色主题切换
- [ ] 页面过渡动画
- [ ] SEO 优化
- [ ] PWA 支持（可选）

---

## 📁 项目结构说明

```
src/
├── components/
│   ├── common/           # 通用组件
│   │   ├── HeroBackground.vue   # 首页动态背景
│   │   └── FeaturedGame.vue     # 精选游戏卡片
│   ├── game/
│   │   └── GameCard.vue         # 游戏卡片
│   └── photos/           # 照片模块组件
│       ├── ChinaMap.vue         # 中国地图 SVG 组件
│       ├── CitySelector.vue     # 城市选择器弹窗
│       ├── PhotoUploader.vue    # 照片上传组件
│       └── PhotoLightbox.vue    # 照片详情弹窗
├── stores/
│   ├── steam.ts          # Steam 数据状态管理
│   └── photos.ts         # 照片数据状态管理
├── views/
│   ├── Home/             # 首页
│   ├── Games/            # 游戏库页面
│   ├── Photos/           # 照片足迹页面
│   └── About/            # 关于我页面
├── layouts/
│   └── MainLayout.vue    # 主布局（导航 + 内容 + 页脚）
└── router/
    └── index.ts          # 路由配置
```

---

## 🎨 设计风格

- **主色调**: Steam 蓝 (#66c0f4) + 紫色渐变
- **背景**: 深色系 (#0d1117, #161b22)
- **风格**: 毛玻璃效果、圆角卡片、微动效
- **字体**: 系统字体栈

---

## 🔧 技术栈

| 类别     | 技术                       |
| -------- | -------------------------- |
| 框架     | Vue 3 (Composition API)    |
| 语言     | TypeScript                 |
| 状态管理 | Pinia                      |
| 路由     | Vue Router 4               |
| 构建工具 | Vite                       |
| 样式     | Scoped CSS + CSS Variables |
| 部署     | GitHub Pages + Actions     |
| 数据     | Steam Web API              |

---

## 📝 备注

- Steam API Key 和 Steam ID 配置在 `scripts/fetch-steam-data.js`
- 照片数据存储在浏览器 localStorage，key 为 `mays_photo_groups`
- GitHub Pages 部署需要设置 `vite.config.ts` 中的 `base` 为仓库名（如 `/mays_blog/`）

---

_最后更新: 2025-11_
