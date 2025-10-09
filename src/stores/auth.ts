import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { UserType } from "@/types/user";
import router from "@/router";

export const useAuthStore = defineStore("auth", () => {
  const isAuthenticated = ref<boolean>(false || localStorage.getItem("isAuthenticated") === "true");
  const user = ref<UserType | null>(
    localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null
  );
  const token = ref<string | null>(localStorage.getItem("token"));
  const apiUrl = "http://localhost:8000/api";
  const message = ref<string | null>(null);
  const login = (userData: UserType, authToken: string, msg: string) => {
    user.value = userData;
    token.value = authToken;
    isAuthenticated.value = true;
    // set welcome message
    message.value = msg;
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", authToken);
    localStorage.setItem("isAuthenticated", "true");
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    isAuthenticated.value = false;

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.setItem("isAuthenticated", "false");
  };

  const checkAuth = () => {
    const authStatus = localStorage.getItem("isAuthenticated");

    if (authStatus == "true") {
      router.push({ name: "home" });
    } else {
      router.push({ name: "login" });
    }
  };

  const getUser = computed(() => user.value);
  const getToken = computed(() => token.value);
  const getAuthStatus = computed(() => isAuthenticated.value);
  return {
    isAuthenticated,
    user,
    token,
    login,
    logout,
    getUser,
    getToken,
    getAuthStatus,
    apiUrl,
    checkAuth,
    message,
  };
});
