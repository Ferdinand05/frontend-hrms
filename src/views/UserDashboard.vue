<script lang="ts" setup>
import Button from "@/components/ui/button/Button.vue";
import DefaultLayout from "./layouts/DefaultLayout.vue";
import { CalendarCheck, CalendarX2, DollarSign, User } from "lucide-vue-next";

const navItem = [
  {
    name: "Profile",
    href: "/user/profile",
    icon: User,
  },
  {
    name: "Leave",
    href: "/user/leaves",
    icon: CalendarX2,
  },
  {
    name: "Attendance",
    href: "/user/attendance",
    icon: CalendarCheck,
  },
  {
    name: "Payroll",
    href: "/user/payroll",
    icon: DollarSign,
  },
];
</script>

<template>
  <DefaultLayout>
    <div>
      <h1 class="font-semibold text-lg md:text-xl">User Menu</h1>
      <p class="font-light">Controll and see your history</p>
    </div>
    <div class="md:flex md:gap-x-16">
      <!-- nav -->
      <nav class="">
        <div class="grid-cols-1 grid gap-y-2 md:w-36 md:mt-4 md:py-4 mt-3">
          <Button
            variant="ghost"
            class="text-sm md:text-neutral font-medium w-full"
            v-for="(item, index) in navItem"
            :key="index"
          >
            <RouterLink class="w-full" :to="item.href">
              <div class="flex items-center text-left w-full">
                <component :is="item.icon" class="inline mr-2" />
                <div>
                  {{ item.name }}
                </div>
              </div>
            </RouterLink>
          </Button>
        </div>
      </nav>
      <!-- content -->
      <div class="mt-3 md:mt-4 py-4 w-full md:max-w-2xl">
        <main>
          <slot />
        </main>
      </div>
    </div>
  </DefaultLayout>
</template>
