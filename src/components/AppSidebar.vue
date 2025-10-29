<script lang="ts" setup>
import {
  CalendarCheck,
  CalendarX2,
  ChevronUp,
  DollarSign,
  Home,
  LayoutDashboard,
  LogOut,
  Logs,
  Settings,
  Shield,
  SquareUser,
  User2,
  Users,
  Wallet,
  Warehouse,
} from "lucide-vue-next";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import SidebarHeader from "./ui/sidebar/SidebarHeader.vue";
import DropdownMenu from "./ui/dropdown-menu/DropdownMenu.vue";
import DropdownMenuTrigger from "./ui/dropdown-menu/DropdownMenuTrigger.vue";
import DropdownMenuContent from "./ui/dropdown-menu/DropdownMenuContent.vue";
import DropdownMenuItem from "./ui/dropdown-menu/DropdownMenuItem.vue";
import SidebarFooter from "./ui/sidebar/SidebarFooter.vue";
import SidebarGroupItem from "./SidebarGroupItem.vue";
import { useAuthStore } from "@/stores/auth";
import axios from "axios";
import { ref } from "vue";

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

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
];

const userItems = [
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Roles",
    url: "/admin/roles",
    icon: Shield,
  },
];

const employeeItems = [
  {
    title: "Departments",
    url: "/admin/departments",
    icon: Warehouse,
  },
  {
    title: "Employees",
    url: "/admin/employees",
    icon: SquareUser,
  },
  {
    title: "Attendance",
    url: "/admin/attendances",
    icon: CalendarCheck,
  },
  {
    title: "Leave",
    url: "/admin/leaves",
    icon: CalendarX2,
  },
];

const payrollItems = [
  {
    title: "Salaries",
    url: "/admin/salaries",
    icon: Wallet,
  },
  {
    title: "Payroll",
    url: "/admin/payrolls",
    icon: DollarSign,
  },
];
</script>

<template>
  <Sidebar collapsible="icon">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <router-link to="/">
              <Home />
              <span class="font-semibold text-lg">HRMS Dashboard</span>
            </router-link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent>
      <!-- items link -->
      <SidebarGroupItem label="Platform" :items="items" />
      <SidebarGroupItem label="User" :items="userItems" />
      <SidebarGroupItem label="Employee" :items="employeeItems" />
      <SidebarGroupItem label="Payroll" :items="payrollItems" />
    </SidebarContent>

    <!-- sidebar footer -->
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton>
                <User2 /> {{ authStore.user?.name }}
                <ChevronUp class="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" class="w-[--reka-popper-anchor-width]">
              <DropdownMenuItem>
                <RouterLink :to="{ name: 'settings' }" class="flex gap-x-2 items-center">
                  <Settings />
                  <span>Settings</span>
                </RouterLink>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <RouterLink :to="{ name: 'logs' }" class="flex gap-x-2 items-center">
                  <Logs />
                  <span>Logs</span>
                </RouterLink>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div
                  class="flex gap-x-2 items-center hover:cursor-pointer"
                  @click.prevent="logout()"
                >
                  <LogOut />
                  <span>Sign out</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  </Sidebar>
</template>
