<script lang="ts" setup>
import AppSidebar from "@/components/AppSidebar.vue";
import SidebarProvider from "@/components/ui/sidebar/SidebarProvider.vue";
import SidebarTrigger from "@/components/ui/sidebar/SidebarTrigger.vue";
import type { breadcrumbItem } from "@/types/breadcrumb";
import BreadcrumbDashboard from "@/components/BreadcrumbDashboard.vue";
import HeadingDashboard from "@/components/HeadingDashboard.vue";

const props = defineProps<{
  breadcrumbs: breadcrumbItem[];
  heading: string;
  subheading?: string;
}>();
</script>

<template>
  <SidebarProvider :default-open="true">
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
