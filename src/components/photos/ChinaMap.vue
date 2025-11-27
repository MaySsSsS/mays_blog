<template>
  <div class="china-map-container">
    <svg
      viewBox="73 12 560 500"
      class="china-map"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <!-- 省份渐变 -->
        <linearGradient
          id="provinceGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" style="stop-color: #e8f4fc; stop-opacity: 1" />
          <stop offset="100%" style="stop-color: #d0e8f8; stop-opacity: 1" />
        </linearGradient>
        <!-- 已访问省份渐变 -->
        <linearGradient
          id="visitedGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" style="stop-color: #4ade80; stop-opacity: 1" />
          <stop offset="100%" style="stop-color: #22c55e; stop-opacity: 1" />
        </linearGradient>
        <!-- 当前选中渐变 -->
        <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color: #60a5fa; stop-opacity: 1" />
          <stop offset="100%" style="stop-color: #3b82f6; stop-opacity: 1" />
        </linearGradient>
        <!-- 阴影 -->
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="3"
            flood-color="#000"
            flood-opacity="0.1"
          />
        </filter>
      </defs>

      <!-- 省份路径 -->
      <g class="provinces">
        <path
          v-for="province in provinces"
          :key="province.id"
          :d="province.path"
          :class="[
            'province',
            {
              visited: isVisited(province.id),
              active: isActive(province.id),
            },
          ]"
          @click="handleProvinceClick(province)"
          @mouseenter="hoveredProvince = province.id"
          @mouseleave="hoveredProvince = null"
        />
      </g>

      <!-- 城市标记点 -->
      <g class="city-markers">
        <g
          v-for="city in visibleCities"
          :key="city.name"
          :class="['city-marker', { active: city.name === activeCity }]"
          :transform="`translate(${city.x}, ${city.y})`"
          @click="$emit('select', city.name)"
        >
          <!-- 脉冲动画背景 -->
          <circle
            v-if="city.name === activeCity"
            class="pulse-ring"
            r="12"
            fill="none"
            stroke="#3b82f6"
            stroke-width="2"
          />
          <!-- 外圈 -->
          <circle
            class="marker-outer"
            r="8"
            :fill="city.name === activeCity ? '#3b82f6' : '#22c55e'"
          />
          <!-- 内圈 -->
          <circle class="marker-inner" r="4" fill="white" />
          <!-- 城市名称 -->
          <text
            class="city-label"
            :x="city.labelOffset?.x || 0"
            :y="city.labelOffset?.y || -14"
            text-anchor="middle"
          >
            {{ city.name }}
          </text>
          <!-- 照片数量 -->
          <g
            v-if="cityPhotoCounts[city.name]"
            :transform="`translate(10, -10)`"
          >
            <circle r="8" fill="#f97316" />
            <text
              class="photo-count"
              text-anchor="middle"
              dominant-baseline="central"
              fill="white"
              font-size="9"
              font-weight="bold"
            >
              {{ cityPhotoCounts[city.name] }}
            </text>
          </g>
        </g>
      </g>

      <!-- 连接线 -->
      <g v-if="showConnections && visitedCities.length > 1" class="connections">
        <path
          v-for="(connection, index) in cityConnections"
          :key="index"
          :d="connection"
          class="connection-line"
          fill="none"
          stroke="#94a3b8"
          stroke-width="1.5"
          stroke-dasharray="4,4"
        />
      </g>
    </svg>

    <!-- 悬浮提示 -->
    <div
      v-if="hoveredProvince && getProvinceInfo(hoveredProvince)"
      class="tooltip"
      :style="tooltipStyle"
    >
      {{ getProvinceInfo(hoveredProvince)?.name }}
    </div>

    <!-- 图例 -->
    <div class="legend">
      <div class="legend-item">
        <span class="legend-dot visited"></span>
        <span>已去过</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot"></span>
        <span>未去过</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

interface CityPosition {
  name: string;
  x: number;
  y: number;
  province: string;
  labelOffset?: { x: number; y: number };
}

interface Province {
  id: string;
  name: string;
  path: string;
}

const props = defineProps<{
  activeCity: string | null;
  visitedCities: string[];
  cityPhotoCounts: Record<string, number>;
  showConnections?: boolean;
}>();

const emit = defineEmits<{
  (e: "select", city: string): void;
}>();

const hoveredProvince = ref<string | null>(null);
const tooltipStyle = ref({ top: "0px", left: "0px" });

// 中国省份 SVG 路径数据（简化版）
const provinces = ref<Province[]>([
  {
    id: "xinjiang",
    name: "新疆",
    path: "M 140 70 L 220 50 L 280 80 L 300 130 L 280 200 L 230 250 L 170 240 L 120 200 L 100 140 L 110 90 Z",
  },
  {
    id: "tibet",
    name: "西藏",
    path: "M 100 200 L 170 240 L 230 250 L 240 320 L 200 370 L 130 360 L 80 300 L 75 240 Z",
  },
  {
    id: "qinghai",
    name: "青海",
    path: "M 230 200 L 280 200 L 320 230 L 330 290 L 280 320 L 240 320 L 230 250 Z",
  },
  {
    id: "gansu",
    name: "甘肃",
    path: "M 280 130 L 350 100 L 380 150 L 400 200 L 380 230 L 330 250 L 320 230 L 280 200 Z",
  },
  {
    id: "ningxia",
    name: "宁夏",
    path: "M 380 180 L 400 170 L 410 200 L 400 220 L 380 210 Z",
  },
  {
    id: "inner_mongolia",
    name: "内蒙古",
    path: "M 300 50 L 400 30 L 500 50 L 540 80 L 520 120 L 470 140 L 420 130 L 380 150 L 350 100 L 280 80 Z",
  },
  {
    id: "heilongjiang",
    name: "黑龙江",
    path: "M 500 30 L 580 20 L 620 60 L 600 120 L 560 130 L 520 100 L 510 60 Z",
  },
  {
    id: "jilin",
    name: "吉林",
    path: "M 520 100 L 560 130 L 580 160 L 550 180 L 510 170 L 500 130 Z",
  },
  {
    id: "liaoning",
    name: "辽宁",
    path: "M 500 150 L 550 180 L 550 220 L 510 240 L 480 220 L 470 180 Z",
  },
  {
    id: "beijing",
    name: "北京",
    path: "M 465 170 L 480 165 L 485 180 L 475 188 L 462 182 Z",
  },
  {
    id: "tianjin",
    name: "天津",
    path: "M 485 185 L 495 182 L 498 195 L 488 200 L 482 192 Z",
  },
  {
    id: "hebei",
    name: "河北",
    path: "M 450 150 L 500 150 L 510 200 L 490 250 L 450 260 L 430 220 L 440 180 Z",
  },
  {
    id: "shanxi",
    name: "山西",
    path: "M 420 170 L 450 150 L 450 200 L 450 260 L 430 280 L 410 240 L 410 200 Z",
  },
  {
    id: "shandong",
    name: "山东",
    path: "M 490 240 L 540 230 L 560 260 L 540 290 L 490 290 L 470 270 Z",
  },
  {
    id: "henan",
    name: "河南",
    path: "M 430 260 L 490 260 L 490 310 L 450 330 L 420 310 L 410 280 Z",
  },
  {
    id: "shaanxi",
    name: "陕西",
    path: "M 380 220 L 420 200 L 430 260 L 420 310 L 380 330 L 360 290 L 360 250 Z",
  },
  {
    id: "hubei",
    name: "湖北",
    path: "M 420 310 L 480 310 L 490 350 L 450 370 L 410 360 L 400 330 Z",
  },
  {
    id: "anhui",
    name: "安徽",
    path: "M 480 290 L 520 280 L 530 330 L 510 370 L 480 360 L 480 310 Z",
  },
  {
    id: "jiangsu",
    name: "江苏",
    path: "M 520 270 L 560 260 L 570 300 L 550 340 L 520 340 L 520 300 Z",
  },
  {
    id: "shanghai",
    name: "上海",
    path: "M 555 330 L 570 325 L 575 345 L 560 350 L 552 340 Z",
  },
  {
    id: "zhejiang",
    name: "浙江",
    path: "M 530 340 L 560 340 L 570 380 L 540 410 L 510 390 L 520 360 Z",
  },
  {
    id: "jiangxi",
    name: "江西",
    path: "M 480 360 L 520 360 L 520 420 L 490 450 L 460 420 L 460 380 Z",
  },
  {
    id: "fujian",
    name: "福建",
    path: "M 520 400 L 560 390 L 570 440 L 540 470 L 510 450 L 510 420 Z",
  },
  {
    id: "taiwan",
    name: "台湾",
    path: "M 575 400 L 590 395 L 595 450 L 580 470 L 570 440 Z",
  },
  {
    id: "hunan",
    name: "湖南",
    path: "M 420 360 L 470 360 L 480 420 L 450 450 L 410 430 L 400 390 Z",
  },
  {
    id: "guangdong",
    name: "广东",
    path: "M 440 450 L 510 450 L 530 490 L 480 510 L 430 500 L 420 470 Z",
  },
  {
    id: "guangxi",
    name: "广西",
    path: "M 370 440 L 430 440 L 440 490 L 400 510 L 350 490 L 350 460 Z",
  },
  {
    id: "hainan",
    name: "海南",
    path: "M 410 520 L 450 515 L 455 550 L 420 560 L 400 540 Z",
  },
  {
    id: "sichuan",
    name: "四川",
    path: "M 280 290 L 360 280 L 400 330 L 400 390 L 350 420 L 290 400 L 270 340 Z",
  },
  {
    id: "chongqing",
    name: "重庆",
    path: "M 380 340 L 410 330 L 420 370 L 400 390 L 375 375 Z",
  },
  {
    id: "guizhou",
    name: "贵州",
    path: "M 350 400 L 400 390 L 420 440 L 380 460 L 340 440 Z",
  },
  {
    id: "yunnan",
    name: "云南",
    path: "M 260 380 L 340 370 L 360 440 L 340 500 L 280 490 L 240 440 Z",
  },
  {
    id: "hongkong",
    name: "香港",
    path: "M 505 495 L 515 493 L 518 502 L 508 505 Z",
  },
  {
    id: "macau",
    name: "澳门",
    path: "M 490 502 L 498 500 L 500 508 L 492 510 Z",
  },
]);

// 主要城市坐标
const cities: CityPosition[] = [
  { name: "北京", x: 475, y: 175, province: "beijing" },
  { name: "天津", x: 490, y: 190, province: "tianjin" },
  { name: "上海", x: 560, y: 340, province: "shanghai" },
  { name: "广州", x: 470, y: 480, province: "guangdong" },
  { name: "深圳", x: 500, y: 490, province: "guangdong" },
  { name: "香港", x: 510, y: 500, province: "hongkong" },
  { name: "澳门", x: 495, y: 505, province: "macau" },
  { name: "重庆", x: 390, y: 360, province: "chongqing" },
  { name: "成都", x: 330, y: 350, province: "sichuan" },
  { name: "武汉", x: 450, y: 340, province: "hubei" },
  { name: "南京", x: 520, y: 310, province: "jiangsu" },
  { name: "杭州", x: 535, y: 365, province: "zhejiang" },
  { name: "西安", x: 395, y: 270, province: "shaanxi" },
  { name: "郑州", x: 450, y: 285, province: "henan" },
  { name: "长沙", x: 445, y: 395, province: "hunan" },
  { name: "福州", x: 545, y: 420, province: "fujian" },
  { name: "厦门", x: 530, y: 450, province: "fujian" },
  { name: "南昌", x: 495, y: 395, province: "jiangxi" },
  { name: "合肥", x: 500, y: 320, province: "anhui" },
  { name: "济南", x: 500, y: 260, province: "shandong" },
  { name: "青岛", x: 540, y: 255, province: "shandong" },
  { name: "太原", x: 430, y: 220, province: "shanxi" },
  { name: "石家庄", x: 460, y: 230, province: "hebei" },
  { name: "沈阳", x: 530, y: 170, province: "liaoning" },
  { name: "大连", x: 530, y: 210, province: "liaoning" },
  { name: "长春", x: 540, y: 140, province: "jilin" },
  { name: "哈尔滨", x: 560, y: 90, province: "heilongjiang" },
  { name: "呼和浩特", x: 430, y: 100, province: "inner_mongolia" },
  { name: "兰州", x: 345, y: 230, province: "gansu" },
  { name: "银川", x: 395, y: 195, province: "ningxia" },
  { name: "西宁", x: 290, y: 260, province: "qinghai" },
  { name: "乌鲁木齐", x: 200, y: 110, province: "xinjiang" },
  { name: "拉萨", x: 170, y: 310, province: "tibet" },
  { name: "昆明", x: 310, y: 440, province: "yunnan" },
  { name: "贵阳", x: 370, y: 430, province: "guizhou" },
  { name: "南宁", x: 385, y: 475, province: "guangxi" },
  { name: "海口", x: 425, y: 535, province: "hainan" },
  { name: "三亚", x: 440, y: 555, province: "hainan" },
  { name: "台北", x: 582, y: 420, province: "taiwan" },
  { name: "高雄", x: 578, y: 455, province: "taiwan" },
  { name: "苏州", x: 540, y: 320, province: "jiangsu" },
  { name: "无锡", x: 545, y: 310, province: "jiangsu" },
  { name: "宁波", x: 555, y: 365, province: "zhejiang" },
  { name: "珠海", x: 480, y: 500, province: "guangdong" },
  { name: "东莞", x: 490, y: 485, province: "guangdong" },
  { name: "佛山", x: 465, y: 485, province: "guangdong" },
];

// 城市到省份的映射
const cityToProvince: Record<string, string> = {};
cities.forEach((city) => {
  cityToProvince[city.name] = city.province;
});

// 获取已访问省份
const visitedProvinces = computed(() => {
  const provinces = new Set<string>();
  props.visitedCities.forEach((city) => {
    const province = cityToProvince[city];
    if (province) provinces.add(province);
  });
  return provinces;
});

// 获取当前选中的省份
const activeProvince = computed(() => {
  if (!props.activeCity) return null;
  return cityToProvince[props.activeCity] || null;
});

// 检查省份是否已访问
const isVisited = (provinceId: string) => {
  return visitedProvinces.value.has(provinceId);
};

// 检查省份是否选中
const isActive = (provinceId: string) => {
  return provinceId === activeProvince.value;
};

// 获取显示的城市（已访问的城市）
const visibleCities = computed(() => {
  return cities.filter((city) => props.visitedCities.includes(city.name));
});

// 城市连接线
const cityConnections = computed(() => {
  const connections: string[] = [];
  const visited = visibleCities.value;

  for (let i = 0; i < visited.length - 1; i++) {
    const from = visited[i];
    const to = visited[i + 1];
    if (from && to) {
      connections.push(`M ${from.x} ${from.y} L ${to.x} ${to.y}`);
    }
  }

  return connections;
});

// 获取省份信息
const getProvinceInfo = (id: string) => {
  return provinces.value.find((p) => p.id === id);
};

// 处理省份点击
const handleProvinceClick = (province: Province) => {
  // 找到该省份的第一个已访问城市
  const city = cities.find(
    (c) => c.province === province.id && props.visitedCities.includes(c.name)
  );
  if (city) {
    emit("select", city.name);
  }
};
</script>

<style scoped>
.china-map-container {
  position: relative;
  width: 100%;
  padding: 1rem;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
  overflow: hidden;
}

.china-map {
  width: 100%;
  height: auto;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.05));
}

.province {
  fill: #e2e8f0;
  stroke: #cbd5e1;
  stroke-width: 1;
  cursor: pointer;
  transition: all 0.3s ease;
}

.province:hover {
  fill: #d1d5db;
  stroke: #9ca3af;
}

.province.visited {
  fill: #86efac;
  stroke: #4ade80;
}

.province.visited:hover {
  fill: #4ade80;
}

.province.active {
  fill: #60a5fa;
  stroke: #3b82f6;
  stroke-width: 2;
}

/* 城市标记 */
.city-marker {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.city-marker:hover {
  transform: scale(1.2);
}

.city-marker.active .marker-outer {
  animation: pulse 1.5s ease-in-out infinite;
}

.marker-outer {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  transition: all 0.3s ease;
}

.city-label {
  font-size: 10px;
  font-weight: 600;
  fill: #374151;
  pointer-events: none;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

.pulse-ring {
  animation: pulse-ring 1.5s ease-out infinite;
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* 连接线 */
.connection-line {
  stroke: #94a3b8;
  stroke-width: 1.5;
  stroke-dasharray: 4, 4;
  opacity: 0.6;
}

/* 悬浮提示 */
.tooltip {
  position: absolute;
  background: white;
  color: #1f2937;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  z-index: 10;
}

/* 图例 */
.legend {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  display: flex;
  gap: 1rem;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: #4b5563;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e2e8f0;
  border: 2px solid #cbd5e1;
}

.legend-dot.visited {
  background: #86efac;
  border-color: #4ade80;
}

/* 响应式 */
@media (max-width: 640px) {
  .china-map-container {
    padding: 0.5rem;
  }

  .legend {
    bottom: 0.5rem;
    left: 0.5rem;
    padding: 0.35rem 0.7rem;
    gap: 0.75rem;
  }

  .legend-item {
    font-size: 0.7rem;
  }

  .city-label {
    font-size: 8px;
  }
}
</style>
