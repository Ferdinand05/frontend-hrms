<script lang="ts" setup>
import SidebarGroup from "./ui/sidebar/SidebarGroup.vue";
import SidebarGroupContent from "./ui/sidebar/SidebarGroupContent.vue";
import SidebarGroupLabel from "./ui/sidebar/SidebarGroupLabel.vue";
import SidebarMenu from "./ui/sidebar/SidebarMenu.vue";
import SidebarMenuButton from "./ui/sidebar/SidebarMenuButton.vue";
import SidebarMenuItem from "./ui/sidebar/SidebarMenuItem.vue";

const props = defineProps<{
  items: {
    title: string;
    url: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
  }[];
  label?: string;
}>();
</script>

<template>
  <SidebarGroup>
    <SidebarGroupLabel>{{ props.label }}</SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem v-for="item in props.items" :key="item.title">
          <SidebarMenuButton asChild>
            <RouterLink :to="item.url">
              <component :is="item.icon" />
              <span>{{ item.title }}</span>
            </RouterLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
</template>
