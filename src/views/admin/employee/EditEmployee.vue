<script lang="ts" setup>
import Button from "@/components/ui/button/Button.vue";
import Input from "@/components/ui/input/Input.vue";
import Label from "@/components/ui/label/Label.vue";
import Textarea from "@/components/ui/textarea/Textarea.vue";
import router from "@/router";
import { useAuthStore } from "@/stores/auth";
import type { Department } from "@/types";
import type { breadcrumbItem } from "@/types/breadcrumb";
import DashboardLayout from "@/views/layouts/DashboardLayout.vue";
import axios from "axios";
import { Loader } from "lucide-vue-next";
import { onMounted, ref } from "vue";
import Select from "@/components/ui/select/Select.vue";
import SelectContent from "@/components/ui/select/SelectContent.vue";
import SelectGroup from "@/components/ui/select/SelectGroup.vue";
import SelectItem from "@/components/ui/select/SelectItem.vue";
import SelectTrigger from "@/components/ui/select/SelectTrigger.vue";
import SelectValue from "@/components/ui/select/SelectValue.vue";
import type { EmployeeType } from "@/types/user";
import Swal from "sweetalert2";

const breadcrumbs: breadcrumbItem[] = [
  {
    name: "Employee",
    href: "/admin/employees",
  },
  {
    name: "Edit Employee",
    href: `/admin/employees/${router.currentRoute.value.params.id}/edit`,
  },
];

const authStore = useAuthStore();
const departments = ref<Department[] | null>(null);
const selectedDepartment = ref<number | null>(null);
function getDepartments() {
  axios
    .get(`${authStore.apiUrl}/departments`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })
    .then((response) => {
      console.log(response.data);
      departments.value = response.data.departments;
    })
    .catch((error) => {
      console.error("Error fetching departments:", error);
    });
}

const employee_id = router.currentRoute.value.params.id;
function getDetailEmployee(id: number) {
  axios
    .get(`${authStore.apiUrl}/employees/${id}`, {
      headers: {
        Authorization: `Bearer ${authStore.getToken}`,
      },
    })
    .then((response) => {
      const employee: EmployeeType = response.data.employee;

      full_name.value = employee.full_name;
      phone.value = employee.phone;
      address.value = employee.address;
      gender.value = employee.gender;
      date_of_birth.value = employee.date_of_birth;
      position.value = employee.position;
      hire_date.value = employee.hire_date;
      currentAvatarUrl.value = employee.avatar;
      selectedDepartment.value = employee.department?.id ?? null;
    })
    .catch((error) => {
      console.log(error);
    });
}

onMounted(() => {
  getDepartments();
  getDetailEmployee(Number(employee_id));
});

const full_name = ref("");
const phone = ref("");
const address = ref("");
const gender = ref("");
const date_of_birth = ref("");
const position = ref("");
const avatar = ref<File | null>(null);
const hire_date = ref("");
const avatarPreview = ref<string | null>(null);
const currentAvatarUrl = ref<string | null>(null);
function onAvatarChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    avatar.value = target.files[0];
    avatarPreview.value = URL.createObjectURL(avatar.value);
  } else {
    avatar.value = null;
  }
}

const formeErrors = ref<Record<string, string[]> | null>(null);
const buttonLoading = ref(false);

function updateEmployee() {
  Swal.fire({
    title: "Are you sure?",
    text: "You are want to update employee!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Update!",
  }).then((result) => {
    if (result.isConfirmed) {
      buttonLoading.value = true;

      axios
        .post(
          `${authStore.apiUrl}/employees/${employee_id}`,
          {
            full_name: full_name.value,
            phone: phone.value,
            address: address.value,
            avatar: avatar.value,
            date_of_birth: date_of_birth.value,
            hire_date: hire_date.value,
            gender: gender.value,
            position: position.value,
            department_id: selectedDepartment.value,
            _method: "put",
          },
          {
            headers: {
              Authorization: `Bearer ${authStore.getToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then((response) => {
          console.log(response.data);

          Swal.fire({
            title: "Updated!",
            text: "Employee has been updated.",
            icon: "success",
            timer: 1200,
            timerProgressBar: true,
            showCancelButton: false,
          });

          router.push({ name: "employees-list" });
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          buttonLoading.value = false;
        });
    }
  });
}

const imageUrl = "http://localhost:8000/storage/";
</script>

<template>
  <DashboardLayout
    :breadcrumbs="breadcrumbs"
    heading="Edit Employee"
    subheading="Edit Employee here"
  >
    <section clas="w-full">
      <form @submit.prevent="updateEmployee()" v-if="full_name" enctype="multipart/form-data">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div class="space-y-2">
            <Label for="fullname">Full Name</Label>
            <Input id="fullname" v-model="full_name" placeholder="Ferdinand" />
          </div>
          <div class="flex justify-between items-end gap-4">
            <div class="space-y-2 flex-1">
              <Label for="avatar">Avatar</Label>
              <Input type="file" id="avatar" @change="onAvatarChange" />
            </div>
            <div
              class="border rounded-md md:w-28 md:h-28 w-24 h-24 flex items-center justify-center"
            >
              <img
                :src="avatarPreview ? avatarPreview : imageUrl + currentAvatarUrl"
                alt=""
                class="object-cover w-full h-full"
              />
            </div>
          </div>
          <div class="space-y-2">
            <Label for="phone">Phone</Label>
            <Input v-model="phone" id="phone" />
          </div>
          <div class="space-y-2">
            <Label for="address">Address</Label>
            <Textarea id="address" v-model="address" placeholder="Where do you live?"></Textarea>
          </div>
          <div>
            <Label class="mb-2" for="gender">Gender</Label>
            <Select v-model="gender" id="gender">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select a gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="male"> Male </SelectItem>
                  <SelectItem value="female"> Female </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="dateofbirth">Date of Birth</Label>
            <Input type="date" id="dateofbirth" v-model="date_of_birth" />
          </div>
          <div class="space-y-2">
            <Label for="position">Position</Label>
            <Input v-model="position" id="position" placeholder="Business Development" />
          </div>
          <div class="space-y-2">
            <Label for="hiredate">Hire Date</Label>
            <Input type="date" id="hiredate" v-model="hire_date" />
          </div>
          <div>
            <Label class="mb-2">Department</Label>
            <Select v-model="selectedDepartment">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select a Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem
                    v-for="(department, index) in departments"
                    :value="department.id"
                    :key="index"
                  >
                    {{ department.name }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div v-if="formeErrors">
          <div class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <ul class="list-disc list-inside text-sm">
              <li v-for="(error, index) in formeErrors" :key="index">{{ error[0] }}</li>
            </ul>
          </div>
        </div>
        <div class="mt-4 flex">
          <Button type="submit" :disabled="buttonLoading"
            ><Loader class="spin-in animate-spin" v-show="buttonLoading" /> Submit</Button
          >
        </div>
      </form>

      <!-- if data not loaded -->
      <div v-else class="flex justify-center items-center gap-x-2">
        <Loader class="spin animate-spin" />
        <p>Loading Data...</p>
      </div>
    </section>
  </DashboardLayout>
</template>
