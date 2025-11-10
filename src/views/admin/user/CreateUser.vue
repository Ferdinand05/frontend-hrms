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
    name: "Create User",
    href: "/admin/users/create",
  },
];
const authStore = useAuthStore();
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
    .get(`${authStore.apiUrl}/employees-without-user`, {
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
  getRoles();
  getEmployees();
});

// Form state
const email = ref("");
const password = ref("");
const password_confirmation = ref("");
const selectedEmployee = ref<number | null>(null);
const selectedRole = ref<number | null>(null);
const formErrors = ref<Record<string, string[]> | null>(null);
const buttonDisabled = ref(false);
function createUser() {
  const userData = {
    email: email.value,
    password: password.value,
    password_confirmation: password_confirmation.value,
    employee_id: selectedEmployee.value,
    role_id: selectedRole.value,
  };

  buttonDisabled.value = true;

  axios
    .post(`${authStore.apiUrl}/users`, userData, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })
    .then((response) => {
      console.log("User created successfully:", response.data);

      Swal.fire({
        icon: "success",
        title: "User Created",
        text: "The user has been created successfully.",
        timer: 1000,
        showConfirmButton: false,
      });

      router.push({ name: "users-list" });
    })
    .catch((error) => {
      console.error("Error creating user:", error);
      if (error.response && error.response.status === 422) {
        formErrors.value = error.response.data.errors;
        console.log("Validation errors:", formErrors.value);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while creating the user.",
        });
      }
    })
    .finally(() => {
      buttonDisabled.value = false;
    });

  console.log("Creating user with data:", userData);
  // Here you would typically send userData to your API to create the user
}
</script>

<template>
  <DashboardLayout
    :breadcrumbs="breadcrumbs"
    heading="Form Create User"
    subheading="Create a new user account"
  >
    <section class="max-w-xl">
      <form autofocus="true" autocomplete="off" @submit.prevent="createUser">
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
            <Loader class="spin animate-spin" v-show="buttonDisabled" /> Create User</Button
          >
        </div>
      </form>
    </section>
  </DashboardLayout>
</template>
