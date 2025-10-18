<script lang="ts" setup>
import {
  CalendarCheck,
  CalendarX2,
  ChevronUp,
  DollarSign,
  Home,
  LayoutDashboard,
  LogOut,
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
                <User2 /> Username
                <ChevronUp class="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" class="w-[--reka-popper-anchor-width]">
              <DropdownMenuItem>
                <a href="http://" class="flex gap-x-2 items-center">
                  <Settings />
                  <span>Settings</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href="http://" class="flex gap-x-2 items-center">
                  <LogOut />
                  <span>Sign out</span>
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  </Sidebar>
</template>
