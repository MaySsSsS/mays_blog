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
            <span class="name">Mays Games</span>
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
          </div>
          <div class="hero-actions">
            <router-link to="/games" class="btn btn-primary">
              <span>🎮</span> 浏览游戏库
            </router-link>
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
import {
  useSteamStore,
  GameCard,
  HeroBackground,
  FeaturedGame,
} from "@mays/shared";
import MainLayout from "@/layouts/MainLayout.vue";

const steamStore = useSteamStore();

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
  const firstGame = favoriteGames.value[0];
  if (!firstGame) return 0;
  return firstGame.playtime_forever;
});

onMounted(() => {
  if (steamStore.games.length === 0) {
    steamStore.fetchGamesData();
  }
});
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: var(--bg-darker);
}

/* Hero Section - 赛博朋克风格 */
.hero {
  position: relative;
  min-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  overflow: hidden;
  background: linear-gradient(180deg, var(--bg-dark) 0%, var(--bg-darker) 100%);
}

/* 赛博朋克光效背景 */
.hero-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(
      ellipse at 20% 20%,
      rgba(0, 240, 255, 0.15) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 80% 80%,
      rgba(255, 0, 255, 0.15) 0%,
      transparent 50%
    );
  pointer-events: none;
  animation: pulse-glow 4s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
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
  border: 3px solid var(--neon-cyan);
  box-shadow: 0 0 30px rgba(0, 240, 255, 0.5), 0 0 60px rgba(0, 240, 255, 0.3);
  position: relative;
  z-index: 1;
}

.status-indicator {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--text-muted);
  border: 3px solid var(--bg-dark);
  z-index: 2;
}

.status-indicator.online {
  background: var(--neon-green);
  box-shadow: 0 0 15px rgba(0, 255, 159, 0.8);
  animation: blink 2s infinite;
}

.hero-title {
  margin-bottom: 1.5rem;
}

.greeting {
  display: block;
  font-size: 1rem;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-weight: 400;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.name {
  display: block;
  font-size: 3.5rem;
  font-weight: 800;
  font-family: var(--font-display);
  background: linear-gradient(
    135deg,
    var(--neon-cyan) 0%,
    var(--neon-pink) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 40px rgba(0, 240, 255, 0.3);
  letter-spacing: 0.05em;
  position: relative;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 3rem;
  line-height: 1.6;
  font-family: var(--font-main);
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
  font-family: var(--font-display);
  background: linear-gradient(135deg, var(--neon-cyan), var(--neon-pink));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  filter: drop-shadow(0 0 10px rgba(0, 240, 255, 0.3));
}

.stat-label {
  display: block;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
  font-family: var(--font-mono);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Buttons - 赛博朋克风格 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 6px;
  font-weight: 600;
  font-family: var(--font-display);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s ease;
}

.btn:hover::before {
  left: 100%;
}

.btn-primary {
  background: transparent;
  border-color: var(--neon-cyan);
  color: var(--neon-cyan);
}

.btn-primary:hover {
  background: rgba(0, 240, 255, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(0, 240, 255, 0.4);
  text-shadow: 0 0 10px var(--neon-cyan);
}

.btn-secondary {
  background: rgba(255, 0, 255, 0.1);
  color: var(--neon-pink);
  border-color: var(--neon-pink);
}

.btn-secondary:hover {
  background: rgba(255, 0, 255, 0.15);
  box-shadow: 0 0 30px rgba(255, 0, 255, 0.4);
  text-shadow: 0 0 10px var(--neon-pink);
}

.btn-large {
  padding: 1.25rem 2.5rem;
  font-size: 1rem;
}

/* Sections */
.section {
  padding: 5rem 2rem;
  position: relative;
}

.section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 240, 255, 0.3),
    transparent
  );
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
  font-family: var(--font-display);
  margin-bottom: 2.5rem;
  color: var(--text-glow);
  text-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
  letter-spacing: 0.05em;
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
  color: var(--text-secondary);
}

.loader {
  width: 50px;
  height: 50px;
  border: 3px solid var(--bg-light);
  border-top-color: var(--neon-cyan);
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
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
    rgba(0, 240, 255, 0.05),
    rgba(255, 0, 255, 0.05)
  );
}

.cta-card {
  text-align: center;
  padding: 4rem;
  background: var(--bg-card);
  border-radius: 12px;
  border: 2px solid rgba(0, 240, 255, 0.2);
  box-shadow: 0 0 40px rgba(0, 240, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.cta-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--neon-cyan),
    var(--neon-pink),
    transparent
  );
}

.cta-card h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--text-glow);
  font-family: var(--font-display);
  text-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
}

.cta-card p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

/* 精选游戏区域布局 */
.featured-section {
  padding-top: 2rem;
  background: var(--bg-dark);
}

.section-subtitle {
  color: var(--text-secondary);
  margin-top: -0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  font-family: var(--font-mono);
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
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
