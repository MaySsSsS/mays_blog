import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "photos",
      component: () => import("../views/Photos/index.vue"),
    },
  ],
});

export default router;
