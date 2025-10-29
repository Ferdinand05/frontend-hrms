<script lang="ts" setup>
import { useAttendanceService } from "@/services/attendanceService";
import type { MenuItem, Office } from "@/types";
import { onMounted, ref } from "vue";

const office = ref<Office | null>(null);
const { getOfficeDetail } = useAttendanceService();
onMounted(() => {
  getOfficeDetail(1)
    .then((response) => {
      office.value = response.data.office;
    })
    .catch((error) => {
      console.log(error);
    });
});

const props = defineProps<{
  menuItem: MenuItem[];
}>();

const colorClasses: Record<string, string> = {
  green: "bg-green-400 hover:bg-green-500",
  red: "bg-red-400 hover:bg-red-500",
  blue: "bg-blue-400 hover:bg-blue-500",
  stone: "bg-stone-400 hover:bg-stone-500",
};
</script>

<template>
  <div class="mt-2">
    <h1 class="font-semibold tracking-wide text-2xl md:text-4xl">Menu</h1>
  </div>

  <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mt-5" v-if="office !== null">
    <button
      :disabled="menu?.disabled"
      v-for="(menu, index) in props.menuItem"
      :key="index"
      type="button"
      @click="menu.function && menu.function()"
      :class="[
        'border py-8 rounded-md hover:cursor-pointer disabled:hover:cursor-not-allowed transition-all duration-300 disabled:bg-gray-300 ',
        colorClasses[menu.color],
      ]"
    >
      <div class="flex flex-col items-center gap-4">
        <h1 class="font-bold text-xl md:text-2xl uppercase">
          {{ menu.name }}
        </h1>
        <component :is="menu.icon" class="size-16 md:size-20"></component>
      </div>
    </button>
  </div>
  <div v-else class="mt-5">
    <p class="text-lg font-semibold flex gap-x-2">
      <Loader class="spin animate-spin transition-all" />
      <span> Loading... </span>
    </p>
  </div>
</template>
