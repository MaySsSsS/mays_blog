<template>
  <div class="app-layout">
    <!-- 导航栏 -->
    <header class="navbar">
      <div class="navbar-container">
        <router-link to="/" class="logo">
          <span class="logo-icon">🎮</span>
          <span class="logo-text">Mays Games</span>
        </router-link>

        <nav class="nav-links">
          <router-link to="/" class="nav-link">
            <span class="nav-icon">🏠</span>
            首页
          </router-link>
          <router-link to="/games" class="nav-link">
            <span class="nav-icon">🎯</span>
            游戏库
          </router-link>
        </nav>

        <button class="mobile-menu-btn" @click="toggleMobileMenu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <!-- 移动端菜单 -->
      <div class="mobile-menu" :class="{ active: mobileMenuOpen }">
        <router-link
          to="/"
          class="mobile-nav-link"
          @click="mobileMenuOpen = false"
          >首页</router-link
        >
        <router-link
          to="/games"
          class="mobile-nav-link"
          @click="mobileMenuOpen = false"
          >游戏库</router-link
        >
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <slot />
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-info">
          <p>© 2024 Mays Games. Steam 游戏库展示</p>
          <p class="footer-sub">Built with Vue 3 + TypeScript + Pinia</p>
        </div>
        <div class="footer-links">
          <a
            href="https://store.steampowered.com"
            target="_blank"
            rel="noopener"
            >Steam</a
          >
          <a href="https://github.com" target="_blank" rel="noopener">GitHub</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const mobileMenuOpen = ref(false);

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value;
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 导航栏 - 赛博朋克风格 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(10, 10, 15, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 2px solid rgba(0, 240, 255, 0.2);
  box-shadow: 0 4px 30px rgba(0, 240, 255, 0.1);
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  font-size: 1.4rem;
  font-weight: 700;
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
}

.logo::after {
  display: none;
}

.logo-icon {
  font-size: 1.6rem;
  filter: drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3));
  animation: bounce-soft 3s ease-in-out infinite;
}

@keyframes bounce-soft {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

.logo-text {
  background: linear-gradient(
    135deg,
    var(--neon-cyan) 0%,
    var(--neon-pink) 100%
  );
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-flow 3s ease infinite;
  text-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
}

@keyframes gradient-flow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.nav-links {
  display: flex;
  gap: 0.5rem;
  background: rgba(15, 15, 25, 0.6);
  padding: 8px;
  border-radius: 8px;
  border: 1px solid rgba(0, 240, 255, 0.2);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.85rem;
  font-family: var(--font-display);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border-radius: 6px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--neon-cyan), var(--neon-pink));
  transition: width 0.3s ease;
}

.nav-link::after {
  display: none;
}

.nav-link:hover {
  color: var(--neon-cyan);
  text-shadow: 0 0 10px var(--neon-cyan);
}

.nav-link:hover::before {
  width: 100%;
}

.nav-link.router-link-active {
  color: var(--neon-cyan);
  background: rgba(0, 240, 255, 0.1);
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.2),
    inset 0 0 20px rgba(0, 240, 255, 0.05);
  text-shadow: 0 0 10px var(--neon-cyan);
}

.nav-link.router-link-active::before {
  width: 100%;
}

.nav-icon {
  font-size: 1rem;
  transition: transform 0.3s ease;
}

.nav-link:hover .nav-icon {
  transform: scale(1.2) rotate(-5deg);
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  display: none;
  flex-direction: column;
  gap: 5px;
  padding: 10px;
  background: rgba(15, 15, 25, 0.8);
  border: 1px solid rgba(0, 240, 255, 0.3);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mobile-menu-btn:hover {
  background: rgba(0, 240, 255, 0.1);
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.3);
  transform: scale(1.05);
}

.mobile-menu-btn span {
  display: block;
  width: 20px;
  height: 2px;
  background: linear-gradient(90deg, var(--neon-cyan), var(--neon-pink));
  border-radius: 2px;
  box-shadow: 0 0 5px var(--neon-cyan);
  transition: all 0.3s ease;
}

.mobile-menu {
  display: none;
  padding: 1rem 1.5rem 1.5rem;
  background: rgba(10, 10, 15, 0.95);
  backdrop-filter: blur(20px);
  border-top: 2px solid rgba(0, 240, 255, 0.3);
}

.mobile-menu.active {
  display: block;
  animation: slide-down 0.3s ease;
}

@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mobile-nav-link {
  display: block;
  padding: 0.9rem 1rem;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  font-family: var(--font-display);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  border-left: 2px solid transparent;
}

.mobile-nav-link:hover,
.mobile-nav-link.router-link-active {
  color: var(--neon-cyan);
  background: rgba(0, 240, 255, 0.1);
  border-left-color: var(--neon-cyan);
  text-shadow: 0 0 10px var(--neon-cyan);
  transform: translateX(5px);
}

/* 主内容 */
.main-content {
  flex: 1;
  margin-top: 72px;
}

/* 页脚 - 赛博朋克风格 */
.footer {
  background: rgba(10, 10, 15, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 2px solid rgba(0, 240, 255, 0.2);
  padding: 2rem;
  position: relative;
}

.footer::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--neon-cyan),
    var(--neon-pink),
    transparent
  );
  opacity: 0.5;
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-info p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-family: var(--font-mono);
}

.footer-sub {
  margin-top: 0.4rem !important;
  font-size: 0.8rem !important;
  color: var(--text-muted) !important;
}

.footer-links {
  display: flex;
  gap: 1rem;
}

.footer-links a {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 600;
  font-family: var(--font-display);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-size: 0.8rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  background: rgba(15, 15, 25, 0.5);
  border: 1px solid rgba(0, 240, 255, 0.2);
}

.footer-links a::after {
  display: none;
}

.footer-links a:hover {
  color: var(--neon-cyan);
  background: rgba(0, 240, 255, 0.1);
  border-color: var(--neon-cyan);
  text-shadow: 0 0 10px var(--neon-cyan);
  transform: translateY(-3px);
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
}

/* 响应式 */
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .navbar-container {
    padding: 0 1rem;
  }

  .footer-container {
    flex-direction: column;
    text-align: center;
  }
}
</style>
