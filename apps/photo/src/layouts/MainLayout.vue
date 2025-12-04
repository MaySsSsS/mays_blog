<template>
  <div class="app-layout">
    <!-- 导航栏 -->
    <header class="navbar">
      <div class="navbar-container">
        <router-link to="/" class="logo">
          <span class="logo-icon">🗺️</span>
          <span class="logo-text">Mays Photos</span>
        </router-link>

        <nav class="nav-links">
          <router-link to="/" class="nav-link">
            <span class="nav-icon">📷</span>
            照片·足迹
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
          >照片·足迹</router-link
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
          <p>© 2024 Mays Photos. 照片·足迹记录</p>
          <p class="footer-sub">Built with Vue 3 + TypeScript + ECharts</p>
        </div>
        <div class="footer-links">
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

/* 导航栏 - 清新自然风格 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-light);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
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
    var(--color-forest) 0%,
    var(--color-sky) 100%
  );
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-flow 5s ease infinite;
  font-weight: 600;
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
  background: var(--bg-secondary);
  padding: 8px;
  border-radius: var(--radius-lg);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.95rem;
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
  position: relative;
}

.nav-link::after {
  display: none;
}

.nav-link:hover {
  color: var(--color-forest);
  background: rgba(45, 90, 61, 0.05);
}

.nav-link.router-link-active {
  color: var(--color-forest);
  background: white;
  box-shadow: var(--shadow-sm);
  font-weight: 600;
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
  background: var(--bg-secondary);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
}

.mobile-menu-btn:hover {
  background: rgba(45, 90, 61, 0.08);
  transform: scale(1.05);
}

.mobile-menu-btn span {
  display: block;
  width: 20px;
  height: 2px;
  background: var(--color-forest);
  border-radius: 2px;
  transition: all 0.3s ease;
}

.mobile-menu {
  display: none;
  padding: 1rem 1.5rem 1.5rem;
  background: white;
  backdrop-filter: blur(10px);
  border-top: 1px solid var(--border-light);
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
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: all 0.3s ease;
}

.mobile-nav-link:hover,
.mobile-nav-link.router-link-active {
  color: var(--color-forest);
  background: rgba(45, 90, 61, 0.05);
  transform: translateX(5px);
  font-weight: 600;
}

/* 主内容 */
.main-content {
  flex: 1;
  margin-top: 72px;
}

/* 页脚 - 清新自然风格 */
.footer {
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-top: 1px solid var(--border-light);
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
  color: var(--text-secondary);
  font-size: 0.9rem;
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
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-full);
  background: var(--bg-secondary);
  border: 1px solid transparent;
}

.footer-links a::after {
  display: none;
}

.footer-links a:hover {
  color: white;
  background: var(--color-forest);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
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
