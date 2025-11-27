<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click.self="close">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="modal-title">选择城市</h3>
            <button class="close-btn" @click="close">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <!-- 搜索框 -->
            <div class="search-box">
              <svg
                class="search-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索城市..."
                class="search-input"
                ref="searchInput"
              />
            </div>

            <!-- 地区分类 -->
            <div class="regions-list">
              <div
                v-for="(cities, region) in filteredCitiesByRegion"
                :key="region"
                class="region-group"
              >
                <h4 class="region-title">{{ region }}</h4>
                <div class="cities-grid">
                  <button
                    v-for="city in cities"
                    :key="city"
                    :class="['city-btn', { selected: city === selectedCity }]"
                    @click="selectCity(city)"
                  >
                    {{ city }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 自定义城市 -->
            <div class="custom-city">
              <span class="custom-label">没有找到？</span>
              <button
                class="add-custom-btn"
                @click="showCustomInput = true"
                v-if="!showCustomInput"
              >
                + 添加自定义位置
              </button>
              <div v-else class="custom-input-group">
                <input
                  v-model="customCity"
                  type="text"
                  placeholder="输入城市/地点名称"
                  class="custom-input"
                  @keyup.enter="confirmCustomCity"
                />
                <button class="confirm-btn" @click="confirmCustomCity">
                  确定
                </button>
                <button class="cancel-btn" @click="showCustomInput = false">
                  取消
                </button>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="close">取消</button>
            <button
              class="btn btn-primary"
              :disabled="!selectedCity"
              @click="confirm"
            >
              确认选择
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";

const props = defineProps<{
  visible: boolean;
  initialCity?: string | null;
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "select", city: string): void;
}>();

const searchQuery = ref("");
const selectedCity = ref<string | null>(null);
const showCustomInput = ref(false);
const customCity = ref("");
const searchInput = ref<HTMLInputElement | null>(null);

// 城市按地区分组
const CITIES_BY_REGION: Record<string, string[]> = {
  华东: [
    "上海",
    "南京",
    "杭州",
    "苏州",
    "无锡",
    "宁波",
    "合肥",
    "济南",
    "青岛",
    "福州",
    "厦门",
    "南昌",
  ],
  华北: ["北京", "天津", "石家庄", "太原", "呼和浩特"],
  东北: ["沈阳", "大连", "长春", "哈尔滨"],
  华中: ["武汉", "长沙", "郑州"],
  华南: [
    "广州",
    "深圳",
    "珠海",
    "东莞",
    "佛山",
    "香港",
    "澳门",
    "南宁",
    "海口",
    "三亚",
  ],
  西南: ["成都", "重庆", "贵阳", "昆明", "拉萨"],
  西北: ["西安", "兰州", "西宁", "银川", "乌鲁木齐"],
  台湾: ["台北", "高雄"],
};

// 搜索过滤
const filteredCitiesByRegion = computed(() => {
  if (!searchQuery.value.trim()) {
    return CITIES_BY_REGION;
  }

  const query = searchQuery.value.toLowerCase();
  const result: Record<string, string[]> = {};

  for (const [region, cities] of Object.entries(CITIES_BY_REGION)) {
    const filtered = cities.filter((city) =>
      city.toLowerCase().includes(query)
    );
    if (filtered.length > 0) {
      result[region] = filtered;
    }
  }

  return result;
});

// 监听弹窗显示
watch(
  () => props.visible,
  (val) => {
    if (val) {
      selectedCity.value = props.initialCity || null;
      searchQuery.value = "";
      showCustomInput.value = false;
      customCity.value = "";
      nextTick(() => {
        searchInput.value?.focus();
      });
    }
  }
);

const selectCity = (city: string) => {
  selectedCity.value = city;
};

const confirmCustomCity = () => {
  if (customCity.value.trim()) {
    selectedCity.value = customCity.value.trim();
    showCustomInput.value = false;
  }
};

const close = () => {
  emit("update:visible", false);
};

const confirm = () => {
  if (selectedCity.value) {
    emit("select", selectedCity.value);
    close();
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(59, 130, 246, 0.08);
  color: #1e293b;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.search-box {
  position: relative;
  margin-bottom: 1.5rem;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #1e293b;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-input::placeholder {
  color: #94a3b8;
}

.regions-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.region-group {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1rem;
}

.region-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #3b82f6;
  margin: 0 0 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.cities-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.city-btn {
  padding: 0.4rem 0.8rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.city-btn:hover {
  background: rgba(59, 130, 246, 0.08);
  border-color: #3b82f6;
  color: #3b82f6;
}

.city-btn.selected {
  background: rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
  color: #3b82f6;
  font-weight: 500;
}

.custom-city {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.custom-label {
  font-size: 0.9rem;
  color: #64748b;
}

.add-custom-btn {
  padding: 0.4rem 0.8rem;
  background: transparent;
  border: 1px dashed #3b82f6;
  border-radius: 8px;
  color: #3b82f6;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-custom-btn:hover {
  background: rgba(59, 130, 246, 0.08);
}

.custom-input-group {
  display: flex;
  gap: 0.5rem;
  flex: 1;
}

.custom-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #1e293b;
  font-size: 0.9rem;
  outline: none;
}

.custom-input:focus {
  border-color: #3b82f6;
}

.confirm-btn,
.cancel-btn {
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-btn {
  background: #3b82f6;
  border: none;
  color: #ffffff;
}

.cancel-btn {
  background: transparent;
  border: 1px solid #e2e8f0;
  color: #64748b;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.btn {
  padding: 0.6rem 1.25rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: transparent;
  border: 1px solid #e2e8f0;
  color: #64748b;
}

.btn-secondary:hover {
  background: #f8fafc;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95) translateY(20px);
}

/* 滚动条样式 */
.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
