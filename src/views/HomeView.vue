<script setup lang="ts">
import { DollarSign, LogIn, LogOut, RocketIcon, ScrollText } from "lucide-vue-next";
import DefaultLayout from "./layouts/DefaultLayout.vue";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/auth";
const authStore = useAuthStore();
const colorClasses: Record<string, string> = {
  green: "bg-green-400 hover:bg-green-500",
  red: "bg-red-400 hover:bg-red-500",
  blue: "bg-blue-400 hover:bg-blue-500",
  gray: "bg-gray-400 hover:bg-gray-500",
};

const menuItem = [
  {
    name: "Check In",
    icon: LogIn,
    color: "green",
  },
  {
    name: "Check out",
    icon: LogOut,
    color: "red",
  },
  {
    name: "Leaves",
    icon: ScrollText,
    color: "gray",
  },
  {
    name: "Payroll",
    icon: DollarSign,
    color: "blue",
  },
];

// check if user is authenticated, if not redirect to login
authStore.checkAuth();
</script>

<!-- TODO : Jika box menu di looping nantinya akan sulit melakukan fungsi, karena masing2 punya fungsi berbeda -->
<template>
  <DefaultLayout>
    <div class="max-w-2xl" v-show="authStore.message">
      <Alert>
        <RocketIcon class="w-4 h-4" />
        <AlertTitle>Welcome!</AlertTitle>
        <AlertDescription> {{ authStore.message }} </AlertDescription>
      </Alert>
    </div>
    <div class="mt-2">
      <h1 class="font-semibold tracking-wide text-2xl md:text-4xl">Menu</h1>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mt-5">
      <button
        v-for="(menu, index) in menuItem"
        :key="index"
        type="button"
        :class="[
          'border py-8 rounded-md hover:cursor-pointer transition-all duration-300',
          colorClasses[menu.color],
        ]"
      >
        <div class="flex flex-col items-center gap-4">
          <h1 class="font-bold text-xl md:text-2xl uppercase">{{ menu.name }}</h1>
          <component :is="menu.icon" class="size-16 md:size-20"></component>
        </div>
      </button>
    </div>
  </DefaultLayout>
</template>
