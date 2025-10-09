<script lang="ts" setup>
import type { breadcrumbItem } from "@/types/breadcrumb";
import Breadcrumb from "./ui/breadcrumb/Breadcrumb.vue";
import BreadcrumbList from "./ui/breadcrumb/BreadcrumbList.vue";
import BreadcrumbItem from "./ui/breadcrumb/BreadcrumbItem.vue";
import BreadcrumbPage from "./ui/breadcrumb/BreadcrumbPage.vue";
import BreadcrumbLink from "./ui/breadcrumb/BreadcrumbLink.vue";
import BreadcrumbSeparator from "./ui/breadcrumb/BreadcrumbSeparator.vue";

const props = defineProps<{
  items: breadcrumbItem[];
}>();
</script>

<template>
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem v-for="(item, index) in props.items" :key="index">
        <BreadcrumbPage v-if="index == props.items.length - 1">
          {{ item.name }}
        </BreadcrumbPage>
        <BreadcrumbLink v-else>
          <RouterLink :to="item.href">
            {{ item.name }}
          </RouterLink>
        </BreadcrumbLink>
        <BreadcrumbSeparator v-if="index < props.items.length - 1" />
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
</template>
