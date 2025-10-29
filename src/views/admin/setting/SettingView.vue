<script lang="ts" setup>
import Button from "@/components/ui/button/Button.vue";
import Input from "@/components/ui/input/Input.vue";
import Label from "@/components/ui/label/Label.vue";
import { useAuthStore } from "@/stores/auth";
import type { Office } from "@/types";
import type { breadcrumbItem } from "@/types/breadcrumb";
import DashboardLayout from "@/views/layouts/DashboardLayout.vue";
import axios from "axios";
import { Loader } from "lucide-vue-next";
import Swal from "sweetalert2";
import { onMounted, ref } from "vue";

const authStore = useAuthStore();
const breadcrumbs: breadcrumbItem[] = [
  {
    name: "Setting",
    href: "/admin/settings",
  },
];

const office = ref<Office | null>(null);
function getDetailOffice() {
  axios
    .get(`${authStore.apiUrl}/offices/1`, {
      headers: {
        Authorization: `Bearer ${authStore.getToken}`,
      },
    })
    .then((response) => {
      office.value = response.data.office;

      // isi field dari data yang diterima
      app_name.value = office.value?.app_name || "";
      latitude.value = office.value?.latitude || "";
      longitude.value = office.value?.longitude || "";
      radius.value = office.value?.radius || 0;
      max_accuracy.value = office.value?.max_accuracy || 0;
      start_time.value = office.value?.start_time || "";
      end_time.value = office.value?.end_time || "";
    })
    .catch((error) => {
      console.log(error);
    });
}

onMounted(() => {
  getDetailOffice();
});

const app_name = ref("");
const latitude = ref("");
const longitude = ref("");
const radius = ref<number>();
const max_accuracy = ref<number>();
const start_time = ref("");
const end_time = ref("");

const buttonLoading = ref<boolean>(false);
function updateOffice() {
  buttonLoading.value = true;
  axios
    .put(
      `${authStore.apiUrl}/offices/1`,
      {
        app_name: app_name.value,
        latitude: latitude.value,
        longitude: longitude.value,
        radius: radius.value,
        max_accuracy: max_accuracy.value,
        start_time: start_time.value,
        end_time: end_time.value,
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.getToken}`,
        },
      }
    )
    .then((response) => {
      console.log(response.data);

      Swal.fire({
        title: "Success!",
        text: `${response.data.message}`,
        icon: "success",
      });

      getDetailOffice();
    })
    .catch((error) => {
      console.log(error);
    })
    .finally(() => {
      buttonLoading.value = false;
    });
}
</script>

<template>
  <DashboardLayout
    :breadcrumbs="breadcrumbs"
    heading="Setting"
    subheading="Setting and Customize your office."
  >
    <section v-if="office">
      <form class="space-y-4 max-w-2xl" @submit.prevent="updateOffice">
        <div class="space-y-2">
          <Label>App Name</Label>
          <Input type="text" v-model="app_name" />
        </div>
        <div class="font-medium text-muted-foreground">Office Location</div>
        <div class="flex gap-x-3">
          <div class="w-full space-y-2">
            <Label>Latitude</Label>
            <Input type="text" v-model="latitude" />
          </div>
          <div class="w-full space-y-2">
            <Label>Longitude</Label>
            <Input type="text" v-model="longitude" />
          </div>
        </div>
        <div class="space-y-2">
          <Label>Radius</Label>
          <Input type="number" v-model="radius" />
        </div>
        <div class="space-y-2">
          <Label>Max Accuracy</Label>
          <Input type="number" v-model="max_accuracy" />
        </div>
        <div class="font-medium text-muted-foreground">Office Time</div>
        <div class="flex gap-x-3">
          <div class="w-full space-y-2">
            <Label>Start Time</Label>
            <Input type="time" v-model="start_time" />
          </div>
          <div class="w-full space-y-2">
            <Label>End Time</Label>
            <Input type="time" v-model="end_time" />
          </div>
        </div>
        <div class="flex justify-end">
          <Button type="submit" class="" :disabled="buttonLoading">Save Changes</Button>
        </div>
      </form>
    </section>
    <div v-else class="flex gap-x-2">
      <Loader class="spin animate-spin transition-all" /> <span>Loading...</span>
    </div>
  </DashboardLayout>
</template>
