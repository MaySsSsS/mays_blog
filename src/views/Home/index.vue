<template>
  <MainLayout>
    <div class="home-page">
      <!-- Hero Section -->
      <section class="hero">
        <!-- 新增：动态游戏封面背景 -->
        <HeroBackground />
        <div class="hero-bg"></div>
        <div class="hero-content">
          <div class="hero-avatar" v-if="steamStore.playerInfo">
            <img :src="steamStore.playerInfo.avatarfull" alt="avatar" />
            <div
              class="status-indicator"
              :class="{ online: steamStore.playerInfo.personastate === 1 }"
            ></div>
          </div>
          <h1 class="hero-title">
            <span class="greeting">Welcome to</span>
            <span class="name">Mays Space</span>
          </h1>
          <p class="hero-subtitle">
            探索我的 Steam 游戏世界，记录每一次冒险与成就
          </p>
          <div class="hero-stats" v-if="!steamStore.loading">
            <div class="stat-item">
              <span class="stat-value">{{
                steamStore.gameStats.totalGames
              }}</span>
              <span class="stat-label">游戏总数</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ formatTotalHours }}</span>
              <span class="stat-label">总游戏时长</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ photoStore.totalPhotos }}</span>
              <span class="stat-label">照片数量</span>
            </div>
          </div>
          <div class="hero-actions">
            <router-link to="/games" class="btn btn-primary">
              <span>🎮</span> 浏览游戏库
            </router-link>
            <router-link to="/photos" class="btn btn-secondary">
              <span>📷</span> 照片足迹
            </router-link>
          </div>
        </div>
      </section>

      <!-- 最近动态区域 -->
      <section class="section recent-activity" v-if="recentActivities.length">
        <div class="container">
          <h2 class="section-title">
            <span class="title-icon">✨</span>
            最近动态
          </h2>
          <p class="section-subtitle">游戏与生活的点滴记录</p>
          <div class="activity-grid">
            <div
              v-for="activity in recentActivities"
              :key="activity.id"
              :class="['activity-card', activity.type]"
            >
              <div class="activity-badge">
                {{ activity.type === "game" ? "🎮" : "📷" }}
              </div>
              <div class="activity-image">
                <img :src="activity.image" :alt="activity.title" />
              </div>
              <div class="activity-content">
                <h3 class="activity-title">{{ activity.title }}</h3>
                <p class="activity-desc">{{ activity.description }}</p>
                <span class="activity-date">{{ activity.date }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 新增：精选游戏区，使用你最常玩的游戏 -->
      <section class="section featured-section" v-if="favoriteGames.length">
        <div class="container">
          <h2 class="section-title">
            <span class="title-icon">🔥</span>
            最爱游戏精选
          </h2>
          <p class="section-subtitle">
            这些是我花时间最多、也最愿意安利给别人的几款游戏
          </p>
          <div class="featured-grid">
            <FeaturedGame
              v-for="game in favoriteGames"
              :key="game.appid"
              :game="game"
              :maxPlaytime="maxPlaytime"
            />
          </div>
        </div>
      </section>

      <!-- 最常游玩的游戏 -->
      <section class="section top-games">
        <div class="container">
          <h2 class="section-title">
            <span class="title-icon">🏆</span>
            最常游玩
          </h2>
          <div class="games-grid" v-if="!steamStore.loading">
            <GameCard
              v-for="game in steamStore.topGames.slice(0, 6)"
              :key="game.appid"
              :game="game"
            />
          </div>
          <div class="loading-state" v-else>
            <div class="loader"></div>
            <p>加载游戏数据中...</p>
          </div>
        </div>
      </section>

      <!-- 最近游玩 -->
      <section
        class="section recent-games"
        v-if="steamStore.recentlyPlayedGames.length > 0"
      >
        <div class="container">
          <h2 class="section-title">
            <span class="title-icon">🕐</span>
            最近游玩
          </h2>
          <div class="games-grid">
            <GameCard
              v-for="game in steamStore.recentlyPlayedGames"
              :key="game.appid"
              :game="game"
              :showRecent="true"
            />
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="section cta-section">
        <div class="container">
          <div class="cta-card">
            <h2>想看完整的游戏库？</h2>
            <p>查看我所有的 Steam 游戏收藏，探索更多精彩内容</p>
            <router-link to="/games" class="btn btn-primary btn-large">
              查看全部游戏
            </router-link>
          </div>
        </div>
      </section>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useSteamStore } from "@/stores/steam";
import { usePhotoStore } from "@/stores/photos";
import MainLayout from "@/layouts/MainLayout.vue";
import GameCard from "@/components/game/GameCard.vue";
import HeroBackground from "@/components/common/HeroBackground.vue";
import FeaturedGame from "@/components/common/FeaturedGame.vue";

const steamStore = useSteamStore();
const photoStore = usePhotoStore();

const formatTotalHours = computed(() => {
  const hours = Math.floor(steamStore.gameStats.totalPlaytime / 60);
  if (hours >= 1000) {
    return `${(hours / 1000).toFixed(1)}k 小时`;
  }
  return `${hours} 小时`;
});

// 新增：根据游戏时长筛选你最爱的几款游戏
const favoriteGames = computed(() => {
  const games = [...steamStore.games];
  // 根据总时长排序，取前 6 个
  return games
    .filter((g) => g.playtime_forever > 0)
    .sort((a, b) => b.playtime_forever - a.playtime_forever)
    .slice(0, 6);
});

const maxPlaytime = computed(() => {
  if (!favoriteGames.value.length) return 0;
  return favoriteGames.value[0].playtime_forever;
});

// 最近动态：混合游戏和照片
interface Activity {
  id: string;
  type: "game" | "photo";
  title: string;
  description: string;
  image: string;
  date: string;
  timestamp: number;
}

const recentActivities = computed<Activity[]>(() => {
  const activities: Activity[] = [];

  // 添加最近游玩的游戏
  for (const game of steamStore.recentlyPlayedGames.slice(0, 3)) {
    const lastPlayed = game.rtime_last_played
      ? new Date(game.rtime_last_played * 1000)
      : new Date();

    activities.push({
      id: `game-${game.appid}`,
      type: "game",
      title: game.name,
      description: `最近玩了 ${Math.floor(
        (game.playtime_2weeks || 0) / 60
      )} 小时`,
      image: `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${game.appid}/header.jpg`,
      date: formatActivityDate(lastPlayed),
      timestamp: lastPlayed.getTime(),
    });
  }

  // 添加最近的照片分组
  for (const group of photoStore.groups.slice(0, 3)) {
    const createdAt = new Date(group.createdAt);
    const latestPhoto = group.photos[0];

    if (latestPhoto) {
      activities.push({
        id: `photo-${group.id}`,
        type: "photo",
        title: group.name,
        description: `${group.city} · ${group.photos.length} 张照片`,
        image: latestPhoto.url || "/placeholder-photo.jpg",
        date: formatActivityDate(createdAt),
        timestamp: createdAt.getTime(),
      });
    }
  }

  // 按时间排序，取前 6 个
  return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 6);
});

const formatActivityDate = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "今天";
  if (days === 1) return "昨天";
  if (days < 7) return `${days} 天前`;
  if (days < 30) return `${Math.floor(days / 7)} 周前`;
  if (days < 365) return `${Math.floor(days / 30)} 个月前`;
  return `${Math.floor(days / 365)} 年前`;
};

onMounted(() => {
  if (steamStore.games.length === 0) {
    steamStore.fetchGamesData();
  }
  photoStore.initSampleData();
});
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f8fafc;
}

/* Hero Section */
.hero {
  position: relative;
  min-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  overflow: hidden;
  background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%);
}

/* hero-bg 轻微光效 */
.hero-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(
      ellipse at 20% 20%,
      rgba(59, 130, 246, 0.08) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 80% 80%,
      rgba(16, 185, 129, 0.08) 0%,
      transparent 50%
    );
  pointer-events: none;
}

.hero-content {
  position: relative;
  text-align: center;
  max-width: 800px;
}

.hero-avatar {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 2rem;
}

.hero-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 4px solid #3b82f6;
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
}

.status-indicator {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #94a3b8;
  border: 3px solid #ffffff;
}

.status-indicator.online {
  background: #10b981;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.6);
}

.hero-title {
  margin-bottom: 1.5rem;
}

.greeting {
  display: block;
  font-size: 1.2rem;
  color: #64748b;
  font-weight: 400;
  margin-bottom: 0.5rem;
}

.name {
  display: block;
  font-size: 3.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 50%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #64748b;
  margin-bottom: 3rem;
  line-height: 1.6;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 3rem;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  color: #3b82f6;
  line-height: 1;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: #64748b;
  margin-top: 0.5rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #ffffff;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: rgba(59, 130, 246, 0.08);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.btn-secondary:hover {
  background: rgba(59, 130, 246, 0.12);
}

.btn-large {
  padding: 1.25rem 2.5rem;
  font-size: 1.1rem;
}

/* Sections */
.section {
  padding: 5rem 2rem;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2.5rem;
  color: #1e293b;
}

.title-icon {
  font-size: 1.5rem;
}

/* Games Grid */
.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 4rem;
  color: #64748b;
}

.loader {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(59, 130, 246, 0.2);
  border-top-color: #3b82f6;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* CTA Section */
.cta-section {
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.05),
    rgba(16, 185, 129, 0.05)
  );
}

.cta-card {
  text-align: center;
  padding: 4rem;
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.cta-card h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #1e293b;
}

.cta-card p {
  color: #64748b;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

/* 精选游戏区域布局 */
.featured-section {
  padding-top: 2rem;
  background: #ffffff;
}

.section-subtitle {
  color: #64748b;
  margin-top: -0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
}

/* 最近动态区域 */
.recent-activity {
  background: linear-gradient(
    180deg,
    rgba(59, 130, 246, 0.02) 0%,
    transparent 100%
  );
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.activity-card {
  position: relative;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.activity-card:hover {
  transform: translateY(-4px);
  border-color: #3b82f6;
  box-shadow: 0 12px 40px rgba(59, 130, 246, 0.15);
}

.activity-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  border-radius: 8px;
  font-size: 1rem;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.activity-image {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.activity-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.activity-card:hover .activity-image img {
  transform: scale(1.05);
}

.activity-image::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 50%, rgba(0, 0, 0, 0.5) 100%);
}

.activity-content {
  padding: 1rem 1.25rem 1.25rem;
}

.activity-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem;
}

.activity-desc {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0 0 0.75rem;
}

.activity-date {
  font-size: 0.8rem;
  color: #94a3b8;
}

.activity-card.game {
  border-color: rgba(59, 130, 246, 0.2);
}

.activity-card.photo {
  border-color: rgba(139, 92, 246, 0.2);
}

.activity-card.game:hover {
  border-color: #3b82f6;
}

.activity-card.photo:hover {
  border-color: #8b5cf6;
}

/* Responsive */
@media (max-width: 768px) {
  .name {
    font-size: 2.5rem;
  }

  .hero-stats {
    gap: 1.5rem;
  }

  .stat-value {
    font-size: 1.75rem;
  }

  .hero-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .games-grid {
    grid-template-columns: 1fr;
  }

  .cta-card {
    padding: 2rem;
  }
}
</style>
