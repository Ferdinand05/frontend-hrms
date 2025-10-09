<script lang="ts" setup>
import { LayoutDashboard, Loader, LogOut, User } from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth";
import axios from "axios";
import { ref } from "vue";
import Button from "./ui/button/Button.vue";
const authStore = useAuthStore();

const isLoading = ref(false);
function logout() {
  isLoading.value = true;
  axios
    .post(
      `${authStore.apiUrl}/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${authStore.getToken}`,
        },
      }
    )
    .then(() => {
      authStore.logout();
      authStore.checkAuth();
    })
    .catch((error) => {
      console.error("There was an error!", error);
    })
    .finally(() => {
      isLoading.value = false;
    });
}
</script>
<template>
  <nav>
    <div class="navbar bg-base-100 shadow-sm px-4 md:px-12">
      <div class="flex-1">
        <router-link to="/" class="btn btn-ghost text-xl"> HRMS </router-link>
      </div>
      <div class="flex-none">
        <router-link
          class="text-sm font-medium"
          v-show="authStore.getAuthStatus == false"
          :to="{ name: 'login' }"
          >Login</router-link
        >

        <ul class="menu menu-horizontal px-1 relative z-50">
          <li>
            <details>
              <summary class="font-semibold">{{ authStore.user?.name }}</summary>
              <ul class="bg-base-100 rounded-t-none p-2 space-y-2">
                <li>
                  <router-link to="/user/profile"><User class="size-4" /> Profile</router-link>
                </li>
                <li v-if="authStore.user?.role_id == 1 || authStore.user?.role_id == 2">
                  <button>
                    <LayoutDashboard class="size-4" />
                    <RouterLink :to="{ name: 'dashboard' }"> Admin</RouterLink>
                  </button>
                </li>
                <li class="">
                  <Button
                    variant="ghost"
                    class="font-normal w-full flex items-center text-left text-red-600"
                    @click.prevent="logout()"
                    :disabled="isLoading"
                  >
                    <LogOut v-show="isLoading == false" class="size-4" />
                    <Loader v-show="isLoading" class="size-4 spin animate-spin" /> Logout
                  </Button>
                </li>
              </ul>
            </details>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
