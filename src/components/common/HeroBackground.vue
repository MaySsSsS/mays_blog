<template>
  <div class="hero-background">
    <!-- 游戏封面背景轮播 -->
    <div class="game-covers">
      <div
        v-for="(game, index) in featuredGames"
        :key="game.appid"
        class="cover-slide"
        :class="{ active: currentIndex === index }"
      >
        <img
          :src="`https://steamcdn-a.akamaihd.net/steam/apps/${game.appid}/library_hero.jpg`"
          :alt="game.name"
          @error="handleImageError($event, game.appid)"
        />
      </div>
    </div>

    <!-- 渐变遮罩 -->
    <div class="overlay"></div>

    <!-- 浮动游戏元素装饰 -->
    <div class="floating-elements">
      <div class="float-icon icon-1">🎮</div>
      <div class="float-icon icon-2">🏆</div>
      <div class="float-icon icon-3">⚔️</div>
      <div class="float-icon icon-4">🎯</div>
      <div class="float-icon icon-5">💎</div>
    </div>

    <!-- 当前游戏名称 -->
    <div class="current-game-name" v-if="featuredGames.length > 0">
      <span class="now-featuring">Now Featuring</span>
      <span class="game-title">{{ featuredGames[currentIndex]?.name }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

// 你最常玩的游戏 appid 列表
const featuredGames = ref([
  { appid: 730, name: "Counter-Strike 2" },
  { appid: 1172470, name: "Apex Legends" },
  { appid: 1091500, name: "Cyberpunk 2077" },
  { appid: 367520, name: "Hollow Knight" },
  { appid: 814380, name: "Sekiro: Shadows Die Twice" },
  { appid: 582010, name: "Monster Hunter: World" },
  { appid: 292030, name: "The Witcher 3: Wild Hunt" },
  { appid: 1238810, name: "Battlefield V" },
]);

const currentIndex = ref(0);
let intervalId: number | null = null;

const handleImageError = (event: Event, appid: number) => {
  // 如果 library_hero 图片加载失败，使用 header 图片作为备用
  const img = event.target as HTMLImageElement;
  img.src = `https://steamcdn-a.akamaihd.net/steam/apps/${appid}/header.jpg`;
};

onMounted(() => {
  // 每5秒切换一次背景
  intervalId = window.setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % featuredGames.value.length;
  }, 5000);
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

<style scoped>
.hero-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.game-covers {
  position: absolute;
  inset: 0;
}

.cover-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 1.5s ease-in-out;
}

.cover-slide.active {
  opacity: 1;
}

.cover-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(2px) brightness(0.4);
  transform: scale(1.05);
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
      180deg,
      rgba(13, 17, 23, 0.7) 0%,
      rgba(13, 17, 23, 0.4) 50%,
      rgba(13, 17, 23, 0.95) 100%
    ),
    radial-gradient(
      ellipse at 30% 20%,
      rgba(102, 192, 244, 0.15) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 70% 80%,
      rgba(168, 85, 247, 0.1) 0%,
      transparent 50%
    );
}

/* 浮动装饰元素 */
.floating-elements {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.float-icon {
  position: absolute;
  font-size: 2rem;
  opacity: 0.1;
  animation: float 20s infinite ease-in-out;
}

.icon-1 {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}
.icon-2 {
  top: 20%;
  right: 15%;
  animation-delay: -4s;
}
.icon-3 {
  bottom: 30%;
  left: 20%;
  animation-delay: -8s;
}
.icon-4 {
  top: 40%;
  right: 25%;
  animation-delay: -12s;
}
.icon-5 {
  bottom: 20%;
  right: 10%;
  animation-delay: -16s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-20px) rotate(5deg);
  }
  50% {
    transform: translateY(0) rotate(0deg);
  }
  75% {
    transform: translateY(20px) rotate(-5deg);
  }
}

/* 当前游戏名称 */
.current-game-name {
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  text-align: right;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.current-game-name:hover {
  opacity: 1;
}

.now-featuring {
  display: block;
  font-size: 0.75rem;
  color: #66c0f4;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 0.25rem;
}

.game-title {
  display: block;
  font-size: 1rem;
  color: #e6edf3;
  font-weight: 500;
}

@media (max-width: 768px) {
  .current-game-name {
    bottom: 1rem;
    right: 1rem;
  }

  .float-icon {
    font-size: 1.5rem;
  }
}
</style>
