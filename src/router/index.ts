import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "@/views/auth/LoginView.vue";
import { userRoutes } from "./userRoutes";
import { adminRoutes } from "./adminRoutes";
import { useAuthStore } from "@/stores/auth";
import ForbiddenView from "@/views/error/ForbiddenView.vue";
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: {
        title: "Home",
        portal: "all",
      },
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
      meta: {
        title: "Login",
        portal: "all",
      },
    },
    // profile user routes
    userRoutes,

    // admin routes
    adminRoutes,

    // error routes
    {
      path: "/:pathMatch(.*)*",
      name: "error.forbidden",
      component: ForbiddenView,
      meta: { title: "404 Not Found", portal: "all" },
    },
  ],
});

// 🔹 Middleware sederhana untuk proteksi route
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated =
    authStore.getAuthStatus || localStorage.getItem("isAuthenticated") === "true";

  // jika belum login dan mencoba mengakses route selain login, redirect ke login
  if (to.name !== "login" && !isAuthenticated) {
    next({ name: "login" });

    // jika sudah login dan authed, redirect ke home
  } else if (to.name === "login" && isAuthenticated) {
    next({ name: "home" });

    // proteksi route berdasarkan role dengan portal di meta
  } else if (to.meta.portal == "admin") {
    // hanya izinkan akses jika role_id 1 (admin) atau 2 (super admin)
    if (authStore.user?.role_id == 1 || authStore.user?.role_id == 2) {
      next();
    } else {
      next({ name: "error.forbidden" });
    }
  } else {
    next();
  }
});

// 🔹 Ganti document.title sesuai meta.title
router.afterEach((to) => {
  document.title = (to.meta.title as string) || "HRMS Application";
});

export default router;
