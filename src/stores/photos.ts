import { defineStore } from "pinia";
import { ref, computed } from "vue";

export interface Photo {
  id: string;
  title: string;
  description?: string;
  date?: string;
  url?: string;
}

export interface PhotoGroup {
  id: string;
  name: string;
  city: string;
  location?: { lat: number; lng: number };
  coverUrl?: string;
  photos: Photo[];
  createdAt: string;
}

// 中国主要城市坐标（用于地图定位）
export const CHINA_CITIES: Record<
  string,
  { lat: number; lng: number; top: string; left: string }
> = {
  北京: { lat: 39.9042, lng: 116.4074, top: "28%", left: "68%" },
  上海: { lat: 31.2304, lng: 121.4737, top: "52%", left: "78%" },
  广州: { lat: 23.1291, lng: 113.2644, top: "75%", left: "65%" },
  深圳: { lat: 22.5431, lng: 114.0579, top: "78%", left: "67%" },
  成都: { lat: 30.5728, lng: 104.0668, top: "55%", left: "48%" },
  重庆: { lat: 29.4316, lng: 106.9123, top: "58%", left: "52%" },
  杭州: { lat: 30.2741, lng: 120.1551, top: "54%", left: "76%" },
  南京: { lat: 32.0603, lng: 118.7969, top: "50%", left: "74%" },
  西安: { lat: 34.3416, lng: 108.9398, top: "45%", left: "55%" },
  武汉: { lat: 30.5928, lng: 114.3055, top: "55%", left: "64%" },
  天津: { lat: 39.3434, lng: 117.3616, top: "30%", left: "70%" },
  苏州: { lat: 31.299, lng: 120.5853, top: "52%", left: "76%" },
  青岛: { lat: 36.0671, lng: 120.3826, top: "38%", left: "75%" },
  大连: { lat: 38.914, lng: 121.6147, top: "30%", left: "76%" },
  厦门: { lat: 24.4798, lng: 118.0894, top: "72%", left: "72%" },
  昆明: { lat: 24.8801, lng: 102.8329, top: "68%", left: "42%" },
  长沙: { lat: 28.2282, lng: 112.9388, top: "62%", left: "62%" },
  哈尔滨: { lat: 45.8038, lng: 126.535, top: "15%", left: "80%" },
  郑州: { lat: 34.7466, lng: 113.6254, top: "45%", left: "63%" },
  沈阳: { lat: 41.8057, lng: 123.4315, top: "22%", left: "76%" },
  济南: { lat: 36.6512, lng: 116.9972, top: "40%", left: "70%" },
  福州: { lat: 26.0745, lng: 119.2965, top: "68%", left: "74%" },
  南宁: { lat: 22.817, lng: 108.3665, top: "78%", left: "52%" },
  贵阳: { lat: 26.647, lng: 106.6302, top: "65%", left: "50%" },
  乌鲁木齐: { lat: 43.8256, lng: 87.6168, top: "25%", left: "18%" },
  拉萨: { lat: 29.65, lng: 91.1, top: "55%", left: "28%" },
  兰州: { lat: 36.0611, lng: 103.8343, top: "42%", left: "45%" },
  太原: { lat: 37.8706, lng: 112.5489, top: "38%", left: "62%" },
  合肥: { lat: 31.8206, lng: 117.2272, top: "52%", left: "70%" },
  南昌: { lat: 28.682, lng: 115.8579, top: "60%", left: "68%" },
  海口: { lat: 20.044, lng: 110.1999, top: "88%", left: "55%" },
  三亚: { lat: 18.2528, lng: 109.512, top: "92%", left: "54%" },
  香港: { lat: 22.3193, lng: 114.1694, top: "80%", left: "68%" },
  澳门: { lat: 22.1987, lng: 113.5439, top: "80%", left: "65%" },
  台北: { lat: 25.033, lng: 121.5654, top: "68%", left: "82%" },
};

const STORAGE_KEY = "mays_photo_groups";

export const usePhotoStore = defineStore("photos", () => {
  // 从 localStorage 加载数据
  const loadFromStorage = (): PhotoGroup[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  // 保存到 localStorage
  const saveToStorage = (data: PhotoGroup[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const groups = ref<PhotoGroup[]>(loadFromStorage());

  // 所有城市列表
  const cities = computed(() => {
    const set = new Set(groups.value.map((g) => g.city));
    return Array.from(set);
  });

  // 按城市分组
  const groupsByCity = computed(() => {
    const map: Record<string, PhotoGroup[]> = {};
    groups.value.forEach((g) => {
      if (!map[g.city]) map[g.city] = [];
      map[g.city].push(g);
    });
    return map;
  });

  // 总照片数
  const totalPhotos = computed(() => {
    return groups.value.reduce((sum, g) => sum + g.photos.length, 0);
  });

  // 添加分组
  const addGroup = (name: string, city: string): PhotoGroup => {
    const cityInfo = CHINA_CITIES[city];
    const newGroup: PhotoGroup = {
      id: `${city}-${Date.now()}`,
      name,
      city,
      location: cityInfo ? { lat: cityInfo.lat, lng: cityInfo.lng } : undefined,
      photos: [],
      createdAt: new Date().toISOString(),
    };
    groups.value.unshift(newGroup);
    saveToStorage(groups.value);
    return newGroup;
  };

  // 删除分组
  const removeGroup = (id: string) => {
    const index = groups.value.findIndex((g) => g.id === id);
    if (index !== -1) {
      groups.value.splice(index, 1);
      saveToStorage(groups.value);
    }
  };

  // 更新分组
  const updateGroup = (id: string, updates: Partial<PhotoGroup>) => {
    const group = groups.value.find((g) => g.id === id);
    if (group) {
      Object.assign(group, updates);
      saveToStorage(groups.value);
    }
  };

  // 添加照片到分组
  const addPhoto = (
    groupId: string,
    photo: Omit<Photo, "id">
  ): Photo | null => {
    const group = groups.value.find((g) => g.id === groupId);
    if (!group) return null;

    const newPhoto: Photo = {
      ...photo,
      id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };
    group.photos.push(newPhoto);
    saveToStorage(groups.value);
    return newPhoto;
  };

  // 删除照片
  const removePhoto = (groupId: string, photoId: string) => {
    const group = groups.value.find((g) => g.id === groupId);
    if (!group) return;

    const index = group.photos.findIndex((p) => p.id === photoId);
    if (index !== -1) {
      group.photos.splice(index, 1);
      saveToStorage(groups.value);
    }
  };

  // 获取城市位置样式
  const getCityStyle = (city: string) => {
    const info = CHINA_CITIES[city];
    return info
      ? { top: info.top, left: info.left }
      : { top: "50%", left: "50%" };
  };

  // 初始化示例数据（如果没有数据）
  const initSampleData = () => {
    if (groups.value.length === 0) {
      groups.value = [
        {
          id: "shanghai-2024",
          name: "2024 上海随拍",
          city: "上海",
          location: { lat: 31.2304, lng: 121.4737 },
          photos: [
            {
              id: "sh-1",
              title: "外滩夜景",
              description: "第一次在冬天的外滩吹风。",
              date: "2024-01-12",
            },
            {
              id: "sh-2",
              title: "武康大楼",
              description: "下午的阳光刚刚好。",
              date: "2024-01-13",
            },
          ],
          createdAt: "2024-01-12T00:00:00.000Z",
        },
        {
          id: "chengdu-2023",
          name: "成都·辣和慢",
          city: "成都",
          location: { lat: 30.5728, lng: 104.0668 },
          photos: [
            {
              id: "cd-1",
              title: "宽窄巷子",
              description: "人很多，但是很舒服。",
              date: "2023-10-02",
            },
          ],
          createdAt: "2023-10-02T00:00:00.000Z",
        },
      ];
      saveToStorage(groups.value);
    }
  };

  return {
    groups,
    cities,
    groupsByCity,
    totalPhotos,
    addGroup,
    removeGroup,
    updateGroup,
    addPhoto,
    removePhoto,
    getCityStyle,
    initSampleData,
    CHINA_CITIES,
  };
});
