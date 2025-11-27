<template>
  <div class="app-layout">
    <!-- 导航栏 -->
    <header class="navbar">
      <div class="navbar-container">
        <router-link to="/" class="logo">
          <span class="logo-icon">🎮</span>
          <span class="logo-text">Mays Space</span>
        </router-link>

        <nav class="nav-links">
          <router-link to="/" class="nav-link">
            <span class="nav-icon">🏠</span>
            首页
          </router-link>
          <router-link to="/games" class="nav-link">
            <span class="nav-icon">🎯</span>
            游戏
          </router-link>
          <router-link to="/photos" class="nav-link">
            <span class="nav-icon">🗺️</span>
            照片·足迹
          </router-link>
          <router-link to="/about" class="nav-link">
            <span class="nav-icon">👤</span>
            关于我
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
          >游戏</router-link
        >
        <router-link
          to="/photos"
          class="mobile-nav-link"
          @click="mobileMenuOpen = false"
          >照片·足迹</router-link
        >
        <router-link
          to="/about"
          class="mobile-nav-link"
          @click="mobileMenuOpen = false"
          >关于我</router-link
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
          <p>© 2024 Mays Space. Personal blog · Games · Photos</p>
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

/* 导航栏 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: 700;
}

.logo-icon {
  font-size: 1.75rem;
}

.logo-text {
  background: linear-gradient(135deg, #3b82f6, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  text-decoration: none;
  color: #64748b;
  font-weight: 500;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.08);
}

.nav-link.router-link-active {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.nav-icon {
  font-size: 1.1rem;
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  display: none;
  flex-direction: column;
  gap: 5px;
  padding: 10px;
  background: none;
  border: none;
  cursor: pointer;
}

.mobile-menu-btn span {
  display: block;
  width: 24px;
  height: 2px;
  background: #3b82f6;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.mobile-menu {
  display: none;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.98);
  border-top: 1px solid #e2e8f0;
}

.mobile-menu.active {
  display: block;
}

.mobile-nav-link {
  display: block;
  padding: 1rem;
  color: #64748b;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.mobile-nav-link:hover,
.mobile-nav-link.router-link-active {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.08);
}

/* 主内容 */
.main-content {
  flex: 1;
  margin-top: 70px;
}

/* 页脚 */
.footer {
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  padding: 2rem;
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
  color: #64748b;
  font-size: 0.9rem;
}

.footer-sub {
  margin-top: 0.5rem !important;
  font-size: 0.8rem !important;
  opacity: 0.7;
}

.footer-links {
  display: flex;
  gap: 1.5rem;
}

.footer-links a {
  color: #64748b;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: #3b82f6;
}

/* 响应式 */
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .footer-container {
    flex-direction: column;
    text-align: center;
  }
}
</style>
