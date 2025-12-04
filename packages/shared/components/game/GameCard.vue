<template>
  <div class="game-card" @click="openSteamPage">
    <div class="card-image">
      <img
        :src="steamStore.getGameHeaderImage(game.appid)"
        :alt="game.name"
        @error="handleImageError"
      />
      <div class="card-overlay">
        <span class="play-icon">▶</span>
      </div>
      <div class="playtime-badge" v-if="game.playtime_forever > 0">
        {{ steamStore.formatPlaytime(game.playtime_forever) }}
      </div>
    </div>
    <div class="card-content">
      <h3 class="game-name">{{ game.name }}</h3>
      <div class="game-meta">
        <span class="meta-item" v-if="showRecent && game.playtime_2weeks">
          <span class="meta-icon">🕐</span>
          近两周: {{ steamStore.formatPlaytime(game.playtime_2weeks) }}
        </span>
        <span class="meta-item" v-if="game.rtime_last_played">
          <span class="meta-icon">📅</span>
          {{ formatLastPlayed(game.rtime_last_played) }}
        </span>
      </div>
    </div>
    <div class="card-glow"></div>
  </div>
</template>

<script setup lang="ts">
import { useSteamStore } from "../../stores/steam";
import type { GameData } from "../../types";

const props = defineProps<{
  game: GameData;
  showRecent?: boolean;
}>();

const steamStore = useSteamStore();

function openSteamPage() {
  window.open(
    `https://store.steampowered.com/app/${props.game.appid}`,
    "_blank"
  );
}

// 占位图片 - 使用 base64 SVG 避免 404
const placeholderImage =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NjAiIGhlaWdodD0iMjE1IiB2aWV3Qm94PSIwIDAgNDYwIDIxNSI+PHJlY3QgZmlsbD0iIzFmMjkzNyIgd2lkdGg9IjQ2MCIgaGVpZ2h0PSIyMTUiLz48dGV4dCBmaWxsPSIjNjM2NmYxIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDAiIHg9IjUwJSIgeT0iNDUlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn46uPC90ZXh0Pjx0ZXh0IGZpbGw9IiM5Y2EzYWYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgeD0iNTAlIiB5PSI2NSUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuWwgemdouWKoOi9veWksei0pTwvdGV4dD48L3N2Zz4=";

function handleImageError(e: Event) {
  const img = e.target as HTMLImageElement;
  // 防止无限循环：如果已经是占位图则不再处理
  if (img.src === placeholderImage) return;
  img.src = placeholderImage;
}

function formatLastPlayed(timestamp: number): string {
  const date = new Date(timestamp * 1000);
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
}
</script>

<style scoped>
.game-card {
  position: relative;
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--border-dark);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.game-card:hover {
  transform: translateY(-10px) scale(1.02);
  border-color: var(--neon-cyan);
  box-shadow: 0 0 30px rgba(0, 240, 255, 0.3), 0 25px 50px rgba(0, 0, 0, 0.5),
    inset 0 0 60px rgba(0, 240, 255, 0.05);
}

.game-card:hover .card-glow {
  opacity: 1;
}

.game-card:hover .card-overlay {
  opacity: 1;
}

.game-card:hover .card-image img {
  transform: scale(1.1);
}

.card-glow {
  position: absolute;
  inset: -2px;
  background: linear-gradient(
    135deg,
    rgba(0, 240, 255, 0.4),
    rgba(255, 0, 255, 0.4)
  );
  border-radius: calc(var(--radius-md) + 2px);
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: -1;
  filter: blur(20px);
  animation: glow-pulse 3s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%,
  100% {
    opacity: 0;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.02);
  }
}

.game-card:hover .card-glow {
  animation: glow-pulse-hover 2s ease-in-out infinite;
}

@keyframes glow-pulse-hover {
  0%,
  100% {
    opacity: 0.8;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.03);
  }
}

.card-image {
  position: relative;
  aspect-ratio: 460 / 215;
  overflow: hidden;
}

.card-image::after {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: left 0.6s ease;
}

.game-card:hover .card-image::after {
  left: 150%;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 240, 255, 0.3),
    rgba(255, 0, 255, 0.3)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.play-icon {
  width: 70px;
  height: 70px;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid var(--neon-cyan);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--neon-cyan);
  padding-left: 6px;
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.5),
    inset 0 0 20px rgba(0, 240, 255, 0.1);
  transition: all 0.3s ease;
  animation: play-pulse 2s ease-in-out infinite;
}

@keyframes play-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 20px rgba(0, 240, 255, 0.5);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 30px rgba(0, 240, 255, 0.8);
  }
}

.playtime-badge {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(10, 10, 15, 0.9);
  backdrop-filter: blur(10px);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 600;
  font-family: var(--font-mono);
  color: var(--neon-cyan);
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.3);
  clip-path: polygon(
    5px 0,
    100% 0,
    100% calc(100% - 5px),
    calc(100% - 5px) 100%,
    0 100%,
    0 5px
  );
}

.card-content {
  padding: 1.5rem;
}

.game-name {
  font-size: 1.15rem;
  font-weight: 700;
  font-family: var(--font-display);
  color: var(--text-primary);
  margin-bottom: 0.85rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: all 0.3s ease;
  letter-spacing: 0.02em;
}

.game-card:hover .game-name {
  color: var(--neon-cyan);
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
}

.game-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-family: var(--font-mono);
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.game-card:hover .meta-item {
  color: var(--neon-cyan);
}

.meta-icon {
  font-size: 1rem;
  filter: grayscale(0.3);
  transition: filter 0.3s ease;
}

.game-card:hover .meta-icon {
  filter: grayscale(0) drop-shadow(0 0 5px var(--neon-cyan));
}
</style>
