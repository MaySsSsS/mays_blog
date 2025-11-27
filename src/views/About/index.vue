<template>
  <MainLayout>
    <div class="about-page">
      <!-- Profile Section -->
      <section class="profile-section">
        <div class="profile-card">
          <div class="profile-avatar" v-if="steamStore.playerInfo">
            <img :src="steamStore.playerInfo.avatarfull" alt="avatar" />
            <div class="level-badge">Lv.99</div>
          </div>
          <div class="profile-avatar placeholder" v-else>
            <span>👤</span>
          </div>

          <h1 class="profile-name">
            {{ steamStore.playerInfo?.personaname || "Gamer" }}
          </h1>
          <p class="profile-bio">
            热爱游戏，享受每一次冒险。从独立游戏到3A大作，探索无限可能。
          </p>

          <div class="profile-links">
            <a
              :href="
                steamStore.playerInfo?.profileurl ||
                'https://store.steampowered.com'
              "
              target="_blank"
              class="profile-link steam"
            >
              <span class="link-icon">🎮</span>
              Steam 主页
            </a>
            <a
              href="https://github.com"
              target="_blank"
              class="profile-link github"
            >
              <span class="link-icon">💻</span>
              GitHub
            </a>
          </div>
        </div>
      </section>

      <!-- Stats Section -->
      <section class="stats-section">
        <div class="container">
          <h2 class="section-title">
            <span class="title-icon">📊</span>
            游戏统计
          </h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">🎮</div>
              <div class="stat-value">
                {{ steamStore.gameStats.totalGames }}
              </div>
              <div class="stat-label">游戏总数</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">⏱️</div>
              <div class="stat-value">{{ formatTotalHours }}</div>
              <div class="stat-label">总游戏时长</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🔥</div>
              <div class="stat-value">
                {{ steamStore.gameStats.recentlyPlayed }}
              </div>
              <div class="stat-label">近期在玩</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🏆</div>
              <div class="stat-value">{{ playedGamesCount }}</div>
              <div class="stat-label">玩过的游戏</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Most Played Section -->
      <section class="favorite-section" v-if="steamStore.gameStats.mostPlayed">
        <div class="container">
          <h2 class="section-title">
            <span class="title-icon">❤️</span>
            最爱游戏
          </h2>
          <div class="favorite-card">
            <div class="favorite-image">
              <img
                :src="
                  steamStore.getGameHeaderImage(
                    steamStore.gameStats.mostPlayed.appid
                  )
                "
                :alt="steamStore.gameStats.mostPlayed.name"
              />
            </div>
            <div class="favorite-info">
              <h3 class="favorite-name">
                {{ steamStore.gameStats.mostPlayed.name }}
              </h3>
              <p class="favorite-playtime">
                累计游玩
                {{
                  steamStore.formatPlaytime(
                    steamStore.gameStats.mostPlayed.playtime_forever
                  )
                }}
              </p>
              <a
                :href="`https://store.steampowered.com/app/${steamStore.gameStats.mostPlayed.appid}`"
                target="_blank"
                class="favorite-link"
              >
                在 Steam 商店查看 →
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- About Site Section -->
      <section class="site-section">
        <div class="container">
          <h2 class="section-title">
            <span class="title-icon">🌐</span>
            关于本站
          </h2>
          <div class="site-info">
            <p>
              这是一个展示我 Steam 游戏收藏的个人网站。数据通过 Steam Web API
              获取， 并使用 GitHub Actions 每日自动更新。
            </p>
            <div class="tech-stack">
              <h4>技术栈</h4>
              <div class="tech-tags">
                <span class="tech-tag">Vue 3</span>
                <span class="tech-tag">TypeScript</span>
                <span class="tech-tag">Pinia</span>
                <span class="tech-tag">Vue Router</span>
                <span class="tech-tag">Vite</span>
                <span class="tech-tag">GitHub Pages</span>
              </div>
            </div>
            <p class="last-updated" v-if="steamStore.lastUpdated">
              数据最后更新: {{ formatDate(steamStore.lastUpdated) }}
            </p>
          </div>
        </div>
      </section>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useSteamStore } from "@/stores/steam";
import MainLayout from "@/layouts/MainLayout.vue";

const steamStore = useSteamStore();

const formatTotalHours = computed(() => {
  const hours = Math.floor(steamStore.gameStats.totalPlaytime / 60);
  return `${hours.toLocaleString()} 小时`;
});

const playedGamesCount = computed(() => {
  return steamStore.games.filter((g) => g.playtime_forever > 0).length;
});

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

onMounted(() => {
  if (steamStore.games.length === 0) {
    steamStore.fetchGamesData();
  }
});
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  padding-bottom: 4rem;
  background: #f8fafc;
}

/* Profile Section */
.profile-section {
  padding: 4rem 2rem;
  display: flex;
  justify-content: center;
  background: linear-gradient(
    180deg,
    rgba(59, 130, 246, 0.08) 0%,
    transparent 100%
  );
}

.profile-card {
  text-align: center;
  max-width: 400px;
}

.profile-avatar {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto 1.5rem;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 4px solid #3b82f6;
  box-shadow: 0 0 40px rgba(59, 130, 246, 0.25);
}

.profile-avatar.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 50%;
  border: 4px solid #3b82f6;
  font-size: 4rem;
}

.level-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #ffffff;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  box-shadow: 0 2px 10px rgba(251, 191, 36, 0.4);
}

.profile-name {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.75rem;
}

.profile-bio {
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.profile-links {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.profile-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.profile-link.steam {
  background: rgba(59, 130, 246, 0.08);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.profile-link.steam:hover {
  background: rgba(59, 130, 246, 0.15);
}

.profile-link.github {
  background: rgba(100, 116, 139, 0.08);
  color: #64748b;
  border: 1px solid rgba(100, 116, 139, 0.2);
}

.profile-link.github:hover {
  background: rgba(100, 116, 139, 0.15);
  color: #1e293b;
}

.link-icon {
  font-size: 1.1rem;
}

/* Stats Section */
.stats-section {
  padding: 4rem 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 2rem;
}

.title-icon {
  font-size: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.stat-card:hover {
  border-color: #3b82f6;
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.1);
}

.stat-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #64748b;
  font-size: 0.9rem;
}

/* Favorite Section */
.favorite-section {
  padding: 4rem 2rem;
  background: rgba(59, 130, 246, 0.03);
}

.favorite-card {
  display: flex;
  gap: 2rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.favorite-image {
  flex: 0 0 460px;
}

.favorite-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.favorite-info {
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.favorite-name {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.75rem;
}

.favorite-playtime {
  color: #3b82f6;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.favorite-link {
  display: inline-block;
  color: #64748b;
  text-decoration: none;
  transition: color 0.3s ease;
}

.favorite-link:hover {
  color: #3b82f6;
}

/* Site Section */
.site-section {
  padding: 4rem 2rem;
}

.site-info {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.site-info p {
  color: #64748b;
  line-height: 1.8;
  margin-bottom: 1.5rem;
}

.tech-stack h4 {
  color: #1e293b;
  margin-bottom: 1rem;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.tech-tag {
  background: rgba(59, 130, 246, 0.08);
  color: #3b82f6;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  border: 1px solid rgba(59, 130, 246, 0.15);
}

.last-updated {
  font-size: 0.85rem;
  opacity: 0.7;
}

/* Responsive */
@media (max-width: 768px) {
  .favorite-card {
    flex-direction: column;
  }

  .favorite-image {
    flex: none;
    aspect-ratio: 460 / 215;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
