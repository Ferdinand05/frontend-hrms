<script lang="ts" setup>
import Button from "@/components/ui/button/Button.vue";
import Input from "@/components/ui/input/Input.vue";
import Label from "@/components/ui/label/Label.vue";
import Select from "@/components/ui/select/Select.vue";
import SelectContent from "@/components/ui/select/SelectContent.vue";
import SelectGroup from "@/components/ui/select/SelectGroup.vue";
import SelectItem from "@/components/ui/select/SelectItem.vue";
import SelectTrigger from "@/components/ui/select/SelectTrigger.vue";
import SelectValue from "@/components/ui/select/SelectValue.vue";
import router from "@/router";
import { useAuthStore } from "@/stores/auth";
import type { RoleType } from "@/types";
import type { breadcrumbItem } from "@/types/breadcrumb";
import type { EmployeeType } from "@/types/user";
import DashboardLayout from "@/views/layouts/DashboardLayout.vue";
import axios from "axios";
import { Loader } from "lucide-vue-next";
import Swal from "sweetalert2";
import { onMounted, ref } from "vue";

const breadcrumbs: breadcrumbItem[] = [
  {
    name: "Users",
    href: "/admin/users",
  },
  {
    name: "Edit User",
    href: "/admin/users/edit",
  },
];

function getDetailUser() {
  axios
    .get(`${authStore.apiUrl}/users/${user_id}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })
    .then((response) => {
      console.log(response.data.user);
      const user = response.data.user;
      email.value = user.email;
      selectedEmployee.value = user.employee.id;
      selectedRole.value = user.role_id;
    })
    .catch((error) => {
      console.error("Error fetching user details:", error);
    });
}

const roles = ref<RoleType[] | null>(null);
function getRoles() {
  axios
    .get(`${authStore.apiUrl}/roles`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })
    .then((response) => {
      console.log(response.data.roles);
      roles.value = response.data.roles;
    })
    .catch((error) => {
      console.error("Error fetching roles:", error);
      roles.value = [];
    });
}

const employees = ref<EmployeeType[]>([]);
function getEmployees() {
  axios
    .get(`${authStore.apiUrl}/employees`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })
    .then((response) => {
      employees.value = response.data.employees;
    })
    .catch((error) => {
      console.error("Error fetching employees:", error);
    });
}

onMounted(() => {
  getDetailUser();
  getRoles();
  getEmployees();
});
const formErrors = ref<Record<string, string[]> | null>(null);
const buttonDisabled = ref(false);
const authStore = useAuthStore();
const user_id = router.currentRoute.value.params.id;
const email = ref("");
const password = ref("");
const password_confirmation = ref("");
const selectedEmployee = ref<number | null>(null);
const selectedRole = ref<number | null>(null);

function updateUser() {
  buttonDisabled.value = true;
  formErrors.value = null;

  const payload = {
    email: email.value,
    password: password.value,
    password_confirmation: password_confirmation.value,
    employee_id: selectedEmployee.value,
    role_id: selectedRole.value,
  };

  axios
    .put(`${authStore.apiUrl}/users/${user_id}`, payload, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })
    .then((response) => {
      console.log(response.data);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "User updated successfully",
        timer: 1100,
        showConfirmButton: false,
      });

      router.push({ name: "users-list" });
    })
    .catch((error) => {
      if (error.response && error.response.status === 422) {
        formErrors.value = error.response.data.errors;
      } else {
        console.error("Error updating user:", error);
      }
    })
    .finally(() => {
      buttonDisabled.value = false;
    });
}
</script>

<template>
  <DashboardLayout :breadcrumbs="breadcrumbs" heading="Edit User" subheading="Edit existing user">
    <section class="max-w-xl" v-if="roles && employees">
      <form autofocus="true" autocomplete="off" @submit.prevent="updateUser">
        <div class="grid gap-2 py-2">
          <Label for="employee">Employee</Label>
          <Select v-model="selectedEmployee" id="employee" name="employee">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Which employee are you ?" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem
                  v-for="(employee, index) in employees"
                  :key="index"
                  :value="employee.id"
                >
                  {{ employee.full_name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div class="grid gap-2 py-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            autocorrect="off"
            autocomplete="off"
            type="email"
            placeholder="fear@example.com"
            v-model="email"
          />
        </div>
        <div class="grid gap-2 py-2">
          <Label for="password">Password</Label>
          <Input id="password" v-model="password" type="password" />
        </div>
        <div class="grid gap-2 py-2">
          <Label for="password_confirmation">Password Confirmation</Label>
          <Input
            id="password"
            type="password"
            v-model="password_confirmation"
            name="password_confirmation"
          />
        </div>

        <div class="grid gap-2 py-2">
          <Label for="role">Role</Label>
          <Select id="role" name="role" v-model="selectedRole">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="(role, index) in roles" :key="index" :value="role.id">
                  {{ role.role_name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div v-if="formErrors">
          <ul class="bg-red-100 text-red-700 ps-6 p-2 rounded mb-2">
            <li class="list-disc text-sm" v-for="(error, index) in formErrors" :key="index">
              {{ error[0] }}
            </li>
          </ul>
        </div>
        <div class="grid gap-2 py-2">
          <Button type="submit" :disabled="buttonDisabled">
            <Loader class="spin animate-spin" v-show="buttonDisabled" /> Update User</Button
          >
        </div>
      </form>
    </section>
    <div v-else class="flex justify-center items-center h-32">
      <Loader class="animate-spin" /> Loading...
    </div>
  </DashboardLayout>
</template>
