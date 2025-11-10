<script lang="ts" setup>
import axios from "axios";
import UserDashboard from "../UserDashboard.vue";
import { useAuthStore } from "@/stores/auth";
import { onMounted, ref } from "vue";
import type { UserType } from "@/types/user";
import { formatToIDR } from "@/services/salaryService";

const authStore = useAuthStore();

const user = ref<UserType | null>(null);
function getProfile() {
  axios
    .get(`${authStore.apiUrl}/user/profile`, {
      headers: {
        Authorization: `Bearer ${authStore.getToken}`,
      },
    })
    .then((response) => {
      console.log(response.data);
      user.value = response.data.user;
    })
    .catch((error) => {
      console.log(error);
    });
}

onMounted(() => {
  getProfile();
});
const imageUrl = "http://localhost:8000/storage/";
</script>

<template>
  <UserDashboard>
    <!-- heading -->
    <div>
      <h1 class="font-semibold">Profile</h1>
      <p class="font-light text-sm">Employee information</p>
    </div>
    <!-- body -->
    <div class="mt-5">
      <section v-if="user">
        <div class="flex flex-col md:flex-row gap-5 md:gap-x-9">
          <div
            class="w-40 h-44 rounded-lg overflow-hidden shadow-md border border-gray-200 flex-shrink-0 bg-gray-50"
          >
            <img
              :src="imageUrl + user?.employee?.avatar"
              alt="Employee Photo"
              class="w-full h-full object-cover object-top"
            />
          </div>
          <div>
            <p class="capitalize text-lg md:text-xl font-bold">
              {{ user.employee?.full_name }}
              <span class="capitalize font-normal text-sm text-muted-foreground">{{
                user.employee?.status
              }}</span>
            </p>
            <div class="capitalize text-sm text-muted-foreground">
              <span>{{ user.employee?.gender }}</span> |
              <span>{{ user.role }}</span>
            </div>
            <div class="capitalize text-muted-foreground">
              <span>{{ user.employee?.department?.name }}</span> |
              <span>{{ user.employee?.position }}</span>
            </div>
          </div>
        </div>
        <div class="mt-5 flex gap-x-5">
          <div>
            <p><span class="font-medium"> Email : </span> {{ user.email }}</p>
            <p><span class="font-medium">Phone :</span> {{ user.employee?.phone }}</p>
            <p>
              <span class="font-medium">Date Of Birth :</span>
              {{ user.employee?.date_of_birth }}
            </p>
            <p><span class="font-medium">Hire Date :</span> {{ user.employee?.hire_date }}</p>
            <p class="capitalize">
              <span class="font-medium">Address :</span> {{ user.employee?.address }}
            </p>
          </div>
          <div>
            <p>
              <span class="font-medium"> Salary : </span>
              {{ formatToIDR(user.employee?.salary?.base_salary as number) }}
            </p>
            <p>
              <span class="font-medium"> Allowance : </span>
              {{ formatToIDR(user.employee?.salary?.allowance as number) }}
            </p>
            <p>
              <span class="font-medium"> Overtime Rate : </span>
              {{ formatToIDR(user.employee?.salary?.overtime_rate as number) }}
            </p>
          </div>
        </div>
      </section>
      <div v-else>
        <p class="text-muted-foreground">Loading...</p>
      </div>
    </div>
  </UserDashboard>
</template>
