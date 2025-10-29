<script lang="ts" setup>
import AppSidebar from "@/components/AppSidebar.vue";
import SidebarProvider from "@/components/ui/sidebar/SidebarProvider.vue";
import SidebarTrigger from "@/components/ui/sidebar/SidebarTrigger.vue";
import type { breadcrumbItem } from "@/types/breadcrumb";
import BreadcrumbDashboard from "@/components/BreadcrumbDashboard.vue";
import HeadingDashboard from "@/components/HeadingDashboard.vue";
import { onMounted, ref, watch } from "vue";

const props = defineProps<{
  breadcrumbs: breadcrumbItem[];
  heading: string;
  subheading?: string;
}>();

const open = ref(false);

// Saat komponen dimount, ambil state terakhir dari localStorage
onMounted(() => {
  const saved = localStorage.getItem("sidebar_open");
  if (saved !== null) {
    open.value = JSON.parse(saved);
  }
});

// Setiap kali open berubah, simpan ke localStorage
watch(open, (val) => {
  localStorage.setItem("sidebar_open", JSON.stringify(val));
});
</script>

<template>
  <SidebarProvider v-model:open="open">
    <AppSidebar />
    <section class="flex flex-col w-full min-h-screen bg-gray-50 dark:bg-gray-900">
      <div class="flex h-6 items-center mt-3 gap-x-5 border-b pb-6 pt-4 px-4">
        <SidebarTrigger />
        <BreadcrumbDashboard :items="props.breadcrumbs" />
      </div>
      <main class="p-8">
        <HeadingDashboard :heading="props.heading" :subheading="props.subheading" />
        <div>
          <slot />
        </div>
      </main>
    </section>
  </SidebarProvider>
</template>
