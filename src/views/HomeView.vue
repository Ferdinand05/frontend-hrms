<script setup lang="ts">
import {
  CameraIcon,
  DollarSign,
  LogIn,
  LogOut,
  MapMinus,
  MapPin,
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
      color: "gray",
    },
    {
      name: "Payroll",
      icon: DollarSign,
      color: "blue",
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
  </DefaultLayout>
</template>
