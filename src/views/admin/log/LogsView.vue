<script lang="ts" setup>
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
import { onMounted, ref } from "vue";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import Badge from "@/components/ui/badge/Badge.vue";
import type { UserType } from "@/types/user";
const breadcrumbs: breadcrumbItem[] = [
  {
    name: "Logs",
    href: "/admin/logs",
  },
];

interface Log {
  id: number;
  log_name: string;
  description: string;
  subject_type: string;
  event: string;
  causer_type: string;
  properties: string;
  created_at: string;
  user: UserType;
}

function getLogs() {
  axios
    .get(`${authStore.apiUrl}/logs`, {
      headers: {
        Authorization: `Bearer ${authStore.getToken}`,
      },
    })
    .then((response) => {
      console.log(response.data);
      logs.value = response.data.logs;
      event.value = response.data.event;
    })
    .catch((error) => {
      console.log(error);
    });
}

const authStore = useAuthStore();
const logs = ref<Log[] | null>(null);
const event = ref<{
  eventCreated: number;
  eventUpdated: number;
  eventDeleted: number;
}>();
onMounted(() => {
  getLogs();
});
</script>

<template>
  <DashboardLayout
    :breadcrumbs="breadcrumbs"
    heading="Logs"
    subheading="Logs view, to see and control what system doing."
  >
    <header class="my-4">
      <div v-if="event" class="flex gap-3">
        <Badge>{{ event?.eventCreated }} Created</Badge>
        <Badge variant="secondary">{{ event?.eventUpdated }} Updated</Badge>
        <Badge variant="destructive">{{ event?.eventDeleted }} Deleted</Badge>
      </div>
    </header>
    <section>
      <!-- 🔥 Bungkus tabel dalam div scrollable -->
      <div class="max-h-[600px] overflow-y-auto border rounded-lg shadow-sm">
        <Table class="min-w-full">
          <TableHeader>
            <TableRow class="bg-gray-100 sticky top-0 z-10">
              <TableHead class="py-3 px-4">Time</TableHead>
              <TableHead class="py-3 px-4">Event</TableHead>
              <TableHead class="py-3 px-4">Log Name</TableHead>
              <TableHead class="py-3 px-4">Description</TableHead>
              <TableHead class="py-3 px-4">Subject Type</TableHead>
              <TableHead class="py-3 px-4">Causer Type</TableHead>
              <TableHead class="py-3 px-4">Properties</TableHead>
              <TableHead class="py-3 px-4">user</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow v-for="(log, index) in logs" :key="index">
              <TableCell class="py-2 px-4">{{ log.created_at }}</TableCell>
              <TableCell class="py-2 px-4">
                <Badge
                  class="capitalize"
                  :variant="
                    log.event == 'created'
                      ? 'default'
                      : log.event == 'updated'
                      ? 'secondary'
                      : log.event == 'deleted'
                      ? 'destructive'
                      : 'outline'
                  "
                >
                  {{ log.event }}
                </Badge>
              </TableCell>
              <TableCell class="py-2 px-4">{{ log.log_name }}</TableCell>
              <TableCell class="py-2 px-4">{{ log.description }}</TableCell>
              <TableCell class="py-2 px-4">{{ log.subject_type }}</TableCell>
              <TableCell class="py-2 px-4">{{ log.causer_type }}</TableCell>
              <TableCell class="py-2 px-4">{{ log.properties }}</TableCell>
              <TableCell class="py-2 px-4">{{ log.user }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </section>
  </DashboardLayout>
</template>
