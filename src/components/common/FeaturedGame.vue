<template>
  <div class="featured-game" @click="openSteamPage">
    <div class="game-image">
      <img
        :src="`https://steamcdn-a.akamaihd.net/steam/apps/${game.appid}/header.jpg`"
        :alt="game.name"
      />
      <div class="play-overlay">
        <span class="play-icon">▶</span>
      </div>
    </div>
    <div class="game-info">
      <h3 class="game-name">{{ game.name }}</h3>
      <div class="game-stats">
        <div class="stat">
          <span class="stat-icon">🕐</span>
          <span class="stat-value">{{ formatPlaytime }}</span>
        </div>
        <div class="stat" v-if="game.rtime_last_played">
          <span class="stat-icon">📅</span>
          <span class="stat-value">{{ formatLastPlayed }}</span>
        </div>
      </div>
      <div class="progress-bar" v-if="maxPlaytime > 0">
        <div
          class="progress-fill"
          :style="{ width: progressPercent + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Game {
  appid: number;
  name: string;
  playtime_forever: number;
  rtime_last_played?: number;
}

const props = defineProps<{
  game: Game;
  maxPlaytime?: number;
}>();

const formatPlaytime = computed(() => {
  const hours = Math.floor(props.game.playtime_forever / 60);
  if (hours >= 1000) {
    return `${(hours / 1000).toFixed(1)}k 小时`;
  }
  return `${hours} 小时`;
});

const formatLastPlayed = computed(() => {
  if (!props.game.rtime_last_played) return "";
  const date = new Date(props.game.rtime_last_played * 1000);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "今天";
  if (diffDays === 1) return "昨天";
  if (diffDays < 7) return `${diffDays} 天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 周前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} 个月前`;
  return `${Math.floor(diffDays / 365)} 年前`;
});

const progressPercent = computed(() => {
  if (!props.maxPlaytime) return 0;
  return Math.min((props.game.playtime_forever / props.maxPlaytime) * 100, 100);
});

const openSteamPage = () => {
  window.open(
    `https://store.steampowered.com/app/${props.game.appid}`,
    "_blank"
  );
};
</script>

<style scoped>
.featured-game {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.featured-game:hover {
  transform: translateY(-4px);
  border-color: #3b82f6;
  box-shadow: 0 12px 40px rgba(59, 130, 246, 0.15);
}

.game-image {
  position: relative;
  aspect-ratio: 460 / 215;
  overflow: hidden;
}

.game-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.featured-game:hover .game-image img {
  transform: scale(1.05);
}

.play-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.featured-game:hover .play-overlay {
  opacity: 1;
}

.play-icon {
  width: 60px;
  height: 60px;
  background: rgba(59, 130, 246, 0.95);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #ffffff;
  padding-left: 4px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.game-info {
  padding: 1.25rem;
}

.game-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.75rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.game-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: #64748b;
}

.stat-icon {
  font-size: 0.9rem;
}

.stat-value {
  color: #3b82f6;
  font-weight: 500;
}

.progress-bar {
  height: 4px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 2px;
  transition: width 0.5s ease;
}
</style>
