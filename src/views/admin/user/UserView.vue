<script lang="ts" setup>
import Button from "@/components/ui/button/Button.vue";
import type { breadcrumbItem } from "@/types/breadcrumb";
import DashboardLayout from "@/views/layouts/DashboardLayout.vue";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Input from "@/components/ui/input/Input.vue";
import { Edit, Eye, PlusCircle, Search, Trash } from "lucide-vue-next";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { onMounted, ref } from "vue";
import type { UserType } from "@/types/user";
import Badge from "@/components/ui/badge/Badge.vue";
import Skeleton from "@/components/ui/skeleton/Skeleton.vue";

const breadcrumbs: breadcrumbItem[] = [
  {
    name: "Users",
    href: "/admin/users",
  },
];

const authStore = useAuthStore();

const users = ref<UserType[] | null>(null);
function getUsers() {
  axios
    .get(`${authStore.apiUrl}/users`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })
    .then((response) => {
      console.log(response.data.users);
      users.value = response.data.users;
    })
    .catch((error) => {
      console.error("Error fetching users:", error);
      users.value = [];
    });
}

// Fetch users when the component is mounted
onMounted(() => {
  getUsers();
});
</script>

<template>
  <DashboardLayout
    :breadcrumbs="breadcrumbs"
    heading="Users"
    subheading="Manage user data and information"
  >
    <section clas="w-full">
      <header class="mb-4 flex flex-col md:flex-row w-full gap-y-2 md:items-center justify-between">
        <div class="relative w-full max-w-sm items-center">
          <Input id="search" type="text" placeholder="Search..." class="pl-10" />
          <span class="absolute start-0 inset-y-0 flex items-center justify-center px-2">
            <Search class="size-6 text-muted-foreground" />
          </span>
        </div>

        <Button class="max-w-sm">
          <PlusCircle />
          <RouterLink :to="{ name: 'create-user' }"> Create User</RouterLink>
        </Button>
      </header>

      <main>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead> Name </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created at</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <!-- jika users belum diload -->
          <TableBody v-if="!users">
            <TableRow v-for="n in 5" :key="n">
              <TableCell><Skeleton class="h-5 w-32" /></TableCell>
              <TableCell><Skeleton class="h-5 w-40" /></TableCell>
              <TableCell><Skeleton class="h-5 w-20" /></TableCell>
              <TableCell><Skeleton class="h-5 w-28" /></TableCell>
              <TableCell><Skeleton class="h-5 w-24" /></TableCell>
            </TableRow>
          </TableBody>

          <!-- user sudah di load -->
          <TableBody>
            <TableRow v-for="(user, index) in users" :key="index">
              <TableCell class="font-medium"> {{ user.name }} </TableCell>
              <TableCell>{{ user.email }}</TableCell>
              <TableCell
                ><Badge>{{ user.role }}</Badge></TableCell
              >
              <TableCell>{{ user.created_at }}</TableCell>
              <TableCell>
                <div class="flex gap-2">
                  <Button size="sm"><Eye /></Button>
                  <Button size="sm"><Edit /></Button>
                  <Button size="sm" variant="destructive"><Trash /></Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </main>
    </section>
  </DashboardLayout>
</template>
