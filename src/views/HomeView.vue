<script setup lang="ts">
import {
  CameraIcon,
  DollarSign,
  LogIn,
  LogOut,
  MapMinus,
  MapPin,
  Printer,
  RocketIcon,
  ScrollText,
} from "lucide-vue-next";
import DefaultLayout from "./layouts/DefaultLayout.vue";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/auth";
import { useGeolocation } from "@vueuse/core";
import Swal from "sweetalert2";
import { computed, onMounted, onUnmounted, ref } from "vue";
import axios from "axios";
import type { Attendance, Office } from "@/types";
import Button from "@/components/ui/button/Button.vue";
import Camera from "simple-vue-camera";
import MenuGrid from "@/components/home/MenuGrid.vue";
import { calculateDistance } from "@/services/attendanceService";
import ModalDialog from "@/components/home/ModalDialog.vue";
import Label from "@/components/ui/label/Label.vue";
import Select from "@/components/ui/select/Select.vue";
import SelectTrigger from "@/components/ui/select/SelectTrigger.vue";
import SelectValue from "@/components/ui/select/SelectValue.vue";
import SelectContent from "@/components/ui/select/SelectContent.vue";
import SelectGroup from "@/components/ui/select/SelectGroup.vue";
import SelectItem from "@/components/ui/select/SelectItem.vue";
import Input from "@/components/ui/input/Input.vue";
import Textarea from "@/components/ui/textarea/Textarea.vue";
import type { Payroll } from "@/types/payroll";
// -------
const authStore = useAuthStore();

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
    })
    .catch((error) => {
      console.log(error);
    });
}

// get today attendance
const todayAttendance = ref<Attendance | null>(null);
function getTodayAttendance() {
  axios
    .get(`${authStore.apiUrl}/attendances/get/today-attendance`, {
      headers: {
        Authorization: `Bearer ${authStore.getToken}`,
      },
    })
    .then((response) => {
      todayAttendance.value = response.data.todayAttendance;
    })
    .catch((error) => {
      console.log(error);
    });
}

// check if user is authenticated, if not redirect to login
// running when component is mounted
onMounted(() => {
  authStore.checkAuth();
  getDetailOffice();
  getTodayAttendance();
});

const { coords, error } = useGeolocation();

const userPicture = ref<File | null>(null);
const openModalPicture = ref<boolean>(false);
const checkLocation = () => {
  if (error.value?.PERMISSION_DENIED == 1) {
    Swal.fire({
      title: "Location unknown?",
      text: "Check and accept permisson to check in!",
      icon: "error",
    });
    return;
  }

  // setup variable
  const userLat = coords.value.latitude;
  const userLng = coords.value.longitude;
  const officeLat = Number(office.value?.latitude);
  const officeLng = Number(office.value?.longitude);
  const allowedRadius = Number(office.value?.radius ?? 50); // default 50 meter
  // hitung jarak dari user ke kantor
  const distance = calculateDistance(userLat, userLng, officeLat, officeLng);

  // Validasi presensi
  if (!office.value || coords.value.accuracy > office.value.max_accuracy) {
    Swal.fire({
      title: "GPS low latency!",
      text: "Make sure GPS active and wait a second!",
      icon: "warning",
    });
    return;
  }

  if (distance <= allowedRadius) {
    // success, clear picture then open modal,
    pictureUrl.value = "";
    userPicture.value = null;
    openModalPicture.value = true;
  } else {
    Swal.fire({
      title: "Out of range!",
      text: `You are ${distance.toFixed(2)} meters away from the office. Move closer to check in.`,
      icon: "error",
    });
  }
};

const menuItem = computed(() => {
  return [
    {
      name: "Check In",
      icon: LogIn,
      color: "green",
      function: checkLocation,
      disabled: todayAttendance.value ? true : false,
    },
    {
      name: "Check out",
      icon: LogOut,
      color: "red",
      function: checkOut,
      disabled: todayAttendance.value?.clock_out ? true : false || !todayAttendance.value,
    },
    {
      name: "Leaves",
      icon: ScrollText,
      color: "stone",
      function: openModalLeaves,
    },
    {
      name: "Payroll",
      icon: DollarSign,
      color: "blue",
      function: openModalPayroll,
    },
  ];
});

// Get a reference of the component
const camera = ref<InstanceType<typeof Camera>>();

const cameraError = (error: Error) => console.log(error);
const cameraStop = () => console.log("camera stopped");
// Use camera reference to call functions
const pictureUrl = ref("");
const snapshot = async () => {
  const blob = await camera.value?.snapshot();
  console.log(blob);
  if (blob) {
    // To show the screenshot with an image tag, create a url
    const url = URL.createObjectURL(blob);
    console.log(url);
    pictureUrl.value = url;
    userPicture.value = new File([blob], `selfie-${authStore.user?.name}.jpg`, { type: blob.type });
    console.log(userPicture.value);

    // stop camera
    camera.value?.stop();
  }
};

// store data absen
const buttonLoading = ref<boolean>(false);
function checkIn() {
  openModalPicture.value = false;

  buttonLoading.value = true;
  axios
    .post(
      `${authStore.apiUrl}/attendances/user/check-in`,
      {
        picture: userPicture.value,
        latitude: coords.value.latitude,
        longitude: coords.value.longitude,
        accuracy: coords.value.accuracy,
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
        title: "Success!",
        text: `Congrats! ${authStore.user?.name}, you are present today!`,
        icon: "success",
      });

      getTodayAttendance();
    })
    .catch((error) => {
      console.log(error.response.status);
      console.log(error.response);

      if (error.response.status == "400") {
        Swal.fire({
          title: "Error!",
          text: `${error.response.data.message}`,
          icon: "error",
        });
      }
    })
    .finally(() => {
      buttonLoading.value = false;
    });
}

// CHECK OUT
function checkOut() {
  if (error.value?.PERMISSION_DENIED == 1) {
    Swal.fire({
      title: "Location unknown?",
      text: "Check and accept permisson to check in!",
      icon: "error",
    });
    return;
  }

  // setup variable
  const userLat = coords.value.latitude;
  const userLng = coords.value.longitude;
  const officeLat = Number(office.value?.latitude);
  const officeLng = Number(office.value?.longitude);
  const allowedRadius = Number(office.value?.radius ?? 50); // default 50 meter
  // hitung jarak dari user ke kantor
  const distance = calculateDistance(userLat, userLng, officeLat, officeLng);

  // Validasi presensi
  if (!office.value || coords.value.accuracy > office.value.max_accuracy) {
    Swal.fire({
      title: "GPS low latency!",
      text: "Make sure GPS active and wait a second!",
      icon: "warning",
    });
    return;
  }

  if (todayAttendance.value?.clock_out) {
    Swal.fire({
      title: "You have already checkout today!",
      text: "See you tomorrow!",
      icon: "warning",
    });

    return;
  }

  if (distance <= allowedRadius) {
    // success, checkout,

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, checkout",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post(
            `${authStore.apiUrl}/attendances/user/check-out`,
            {},
            {
              headers: {
                Authorization: `Bearer ${authStore.getToken}`,
              },
            }
          )
          .then((response) => {
            if (response.status == 201) {
              Swal.fire({
                title: "You are Out!",
                text: `Thank you for your service! see you tomorrow.`,
                icon: "success",
              });
            }

            getTodayAttendance();
          })
          .catch((error) => {
            console.log(error);
            if (error.response.status == "400") {
              Swal.fire({
                title: "Error!",
                text: `${error.response.data.message}`,
                icon: "error",
              });
            }
          });
      }
    });
  } else {
    Swal.fire({
      title: "Out of range!",
      text: `You are ${distance.toFixed(2)} meters away from the office. Move closer to check in.`,
      icon: "error",
    });
  }
}

const currentTime = ref(new Date());

onMounted(() => {
  const interval = setInterval(() => {
    currentTime.value = new Date();
  }, 1000); // update setiap 1 detik

  onUnmounted(() => clearInterval(interval));
});

const formatTime = (date: Date) => {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

//*SECTION - leaves setup
function openModalLeaves() {
  modalLeaves.value = true;
}
const modalLeaves = ref<boolean>(false);

// leaves data
const leave_type = ref("");
const start_date = ref("");
const end_date = ref("");
const reason = ref("");

const formErrors = ref();
const isLoading = ref<boolean>(false);
function userStoreLeaves() {
  isLoading.value = true;

  axios
    .post(
      `${authStore.apiUrl}/leaves/user/create`,
      {
        leave_type: leave_type.value,
        start_date: start_date.value,
        end_date: end_date.value,
        reason: reason.value,
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
        text: `Your request waiting for approval. check in your profile.`,
        icon: "success",
      });

      modalLeaves.value = false;

      // empty data
      leave_type.value = "";
      start_date.value = "";
      end_date.value = "";
      reason.value = "";
    })
    .catch((error) => {
      console.log(error.response.data.errors);
      formErrors.value = error.response.data.errors;
    })
    .finally(() => {
      isLoading.value = false;
    });
}

// SECTION - Payroll

const modalClass = "md:max-w-4xl";
// get data payroll for user this month
const userPayroll = ref<Payroll | null>(null);
const loadUserPayroll = ref<boolean>(false);
function getUserPayrollThisMonth() {
  loadUserPayroll.value = true;
  axios
    .get(`${authStore.apiUrl}/payrolls/user/this-month`, {
      headers: {
        Authorization: `Bearer ${authStore.getToken}`,
      },
    })
    .then((response) => {
      userPayroll.value = response.data.payroll;
    })
    .catch((error) => {
      console.log(error);
    })
    .finally(() => {
      loadUserPayroll.value = false;
    });
}

const modalPayroll = ref<boolean>(false);
function openModalPayroll() {
  getUserPayrollThisMonth();
  modalPayroll.value = true;
}
</script>

<template>
  <DefaultLayout>
    <div v-if="error?.PERMISSION_DENIED == null" class="italic text-sm text-blue-600">
      <div class="flex gap-x-1 items-center">
        <span><MapPin class="size-4" /></span>
        <span>Location Detected : </span>
        <p>{{ coords.latitude }}</p>
        ,
        <p>{{ coords.longitude }}</p>
      </div>
    </div>
    <div v-else>
      <div class="flex gap-x-1 items-center text-red-600">
        <span><MapMinus class="size-4" /></span>
        <span>{{ error.message }}</span>
      </div>
    </div>

    <div class="max-w-2xl" v-show="authStore.message">
      <Alert>
        <RocketIcon class="w-4 h-4" />
        <AlertTitle>Welcome!</AlertTitle>
        <AlertDescription> {{ authStore.message }} </AlertDescription>
      </Alert>
    </div>

    <!-- Menu Item -->
    <MenuGrid :menu-item="menuItem" />

    <div class="w-full p-4 text-center mt-4">
      <h2 class="text-2xl font-semibold tracking-wide">{{ formatTime(currentTime) }}</h2>
    </div>

    <!-- modal where user taking picture -->
    <ModalDialog
      v-model:open="openModalPicture"
      title="Take Picture"
      description="To ensure that you are actually present. Take photo and Check in"
    >
      <section>
        <div v-if="pictureUrl" class="h-[500px]">
          <img :src="pictureUrl" alt="" class="w-full h-full object-cover" />
        </div>

        <Camera
          v-else
          @error="cameraError"
          @stopped="cameraStop"
          :resolution="{ width: 380, height: 400 }"
          ref="camera"
          autoplay
        >
          <button
            type="button"
            class="absolute bottom-7 left-[45%] p-2 hover:cursor-pointer"
            @click="snapshot"
          >
            <CameraIcon class="size-12 text-white p-2" />
          </button>
        </Camera>
      </section>

      <template #footer>
        <Button type="button" @click.prevent="checkIn" v-if="userPicture" class="w-full">
          Check In!
        </Button>
      </template>
    </ModalDialog>

    <!-- modal leaves -->
    <ModalDialog
      title="Submit a leave request"
      description="Fill in all data correctly. According to the situation"
      v-model:open="modalLeaves"
    >
      <section>
        <form class="space-y-3" @submit.prevent="userStoreLeaves">
          <div class="space-y-2">
            <Label>Leave Type</Label>
            <Select v-model="leave_type">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="annual"> Annual </SelectItem>
                  <SelectItem value="sick"> Sick </SelectItem>
                  <SelectItem value="permission"> Permission </SelectItem>
                  <SelectItem value="maternity"> Maternity </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div class="flex gap-x-3 w-full">
            <div class="space-y-2 w-full">
              <Label>Start Date</Label>
              <Input v-model="start_date" type="date" />
            </div>
            <div class="space-y-2 w-full">
              <Label>End Date</Label>
              <Input v-model="end_date" type="date" />
            </div>
          </div>
          <div class="space-y-2">
            <Label>Reason</Label>
            <Textarea v-model="reason" placeholder="Whats going on ?"></Textarea>
          </div>

          <div v-show="formErrors">
            <ul class="list-disc p-2 bg-red-100 rounded-md ps-6">
              <li v-for="(e, i) in formErrors" :key="i" class="text-sm list-disc text-red-600">
                {{ e[0] }}
              </li>
            </ul>
          </div>

          <div class="flex justify-end">
            <Button type="submit" :disabled="isLoading">Submit</Button>
          </div>
        </form>
      </section>
    </ModalDialog>
    <!-- END modal leaves -->

    <!-- modal payroll -->
    <ModalDialog
      :modalClass="modalClass"
      title="Payroll"
      description="Your latest payroll"
      v-model:open="modalPayroll"
    >
      <!-- Loading State -->
      <div v-if="loadUserPayroll" class="p-4 text-center text-gray-500 animate-pulse">
        Loading...
      </div>

      <!-- Data Found -->
      <section v-else-if="userPayroll" class="space-y-4 p-4 bg-gray-50 rounded-xl shadow-inner">
        <!-- Employee Info -->
        <div class="border-b border-gray-200 pb-2">
          <h3 class="text-lg font-semibold text-gray-800 capitalize">
            {{ userPayroll.employee?.full_name }}
            <span class="text-sm text-gray-500">| {{ userPayroll.employee?.employee_code }}</span>
          </h3>
          <p class="text-sm text-gray-600">
            {{ userPayroll.employee?.position }} &middot;
            {{ userPayroll.employee?.department?.name }}
          </p>
        </div>

        <!-- Payroll Period -->
        <div>
          <p class="text-sm text-gray-700 font-medium">
            Period: <span class="text-gray-900">{{ userPayroll.period }}</span>
          </p>
        </div>

        <!-- Payroll Table -->
        <div class="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table class="min-w-full divide-y divide-gray-200 text-sm">
            <thead class="bg-gray-100 text-gray-700">
              <tr>
                <th class="px-4 py-2 text-left font-semibold">Base Salary</th>
                <th class="px-4 py-2 text-left font-semibold">Allowance</th>
                <th class="px-4 py-2 text-left font-semibold">Deduction</th>
                <th class="px-4 py-2 text-left font-semibold">Overtime Hours</th>
                <th class="px-4 py-2 text-left font-semibold">Overtime Rate</th>
                <th class="px-4 py-2 text-left font-semibold">Overtime Pay</th>
                <th class="px-4 py-2 text-left font-semibold">Total Salary</th>
                <th class="px-4 py-2 text-center font-semibold">#</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-100">
              <tr class="hover:bg-gray-50 transition">
                <td class="px-4 py-2 text-gray-800">
                  Rp {{ Number(userPayroll.base_salary).toLocaleString() }}
                </td>
                <td class="px-4 py-2 text-gray-800">
                  Rp {{ Number(userPayroll.allowance).toLocaleString() }}
                </td>
                <td class="px-4 py-2 text-gray-800">
                  Rp {{ Number(userPayroll.deduction).toLocaleString() }}
                </td>
                <td class="px-4 py-2 text-gray-800">{{ userPayroll.overtime_hours }}</td>
                <td class="px-4 py-2 text-gray-800">
                  Rp {{ Number(userPayroll.salary?.overtime_rate).toLocaleString() }}
                </td>
                <td class="px-4 py-2 text-gray-800">
                  Rp {{ Number(userPayroll.overtime_pay).toLocaleString() }}
                </td>
                <td class="px-4 py-2 font-semibold text-green-700">
                  Rp {{ Number(userPayroll.total_salary).toLocaleString() }}
                </td>
                <td class="px-4 py-2 text-center">
                  <Button size="sm" variant="outline" class="flex items-center gap-1">
                    <Printer class="w-4 h-4" /> Print
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- No Data Found -->
      <div v-else class="text-center text-lg text-gray-500 py-6">
        Payroll not found! <br />
        <span class="text-sm text-gray-400">Check regularly.</span>
      </div>

      <template #footer>
        <Button size="sm" @click="modalPayroll = false">Close</Button>
      </template>
    </ModalDialog>
  </DefaultLayout>
</template>
