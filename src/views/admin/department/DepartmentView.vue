<script lang="ts" setup>
import Button from "@/components/ui/button/Button.vue";
import Input from "@/components/ui/input/Input.vue";
import Table from "@/components/ui/table/Table.vue";
import TableBody from "@/components/ui/table/TableBody.vue";
import TableCell from "@/components/ui/table/TableCell.vue";
import TableHead from "@/components/ui/table/TableHead.vue";
import TableHeader from "@/components/ui/table/TableHeader.vue";
import TableRow from "@/components/ui/table/TableRow.vue";
import DashboardLayout from "@/views/layouts/DashboardLayout.vue";
import axios from "axios";
import { Edit, PlusCircle, Search, Trash } from "lucide-vue-next";
import { onMounted, ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import Skeleton from "@/components/ui/skeleton/Skeleton.vue";
import Swal from "sweetalert2";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Textarea from "@/components/ui/textarea/Textarea.vue";
import type { Department } from "@/types";

const authStore = useAuthStore();
const breadcrumbs = [
  {
    name: "Departments",
    href: "/admin/departments",
  },
];

const departments = ref<Department[] | null>(null);
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

onMounted(() => {
  getDepartments();
});

const name = ref("");
const description = ref("");
const idDepartment = ref<number | null>(null);
const modalCreateOpen = ref<boolean>(false);
const modalUpdateOpen = ref<boolean>(false);
const formErrors = ref<Record<string, string[]> | null>(null);
const buttonDisabled = ref(false);
function createDepartment() {
  // Logic to create a new department

  buttonDisabled.value = true;

  axios
    .post(
      `${authStore.apiUrl}/departments`,
      {
        name: name.value,
        description: description.value,
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    )
    .then((response) => {
      console.log(response.data);
      // Refresh the department list after creation
      getDepartments();
      modalCreateOpen.value = false;

      // Reset form fields
      name.value = "";
      description.value = "";
      formErrors.value = null;

      Swal.fire({
        title: "Created!",
        text: "Your data has been Created.",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
      });
    })
    .catch((error) => {
      console.log("Error creating department:", error.response.data);
      if (error.response.data.errors) {
        formErrors.value = error.response.data.errors;
      }
    })
    .finally(() => {
      buttonDisabled.value = false;
    });
}

function fillModal(department: Department) {
  modalUpdateOpen.value = true;

  name.value = department.name;
  description.value = department.description;
  idDepartment.value = department.id;
  // Logic to fill the modal with department data
  console.log("Filling modal with department:", department);
}

function updateDepartment(id: number) {
  // Logic to update the department

  buttonDisabled.value = true;

  axios
    .put(
      `${authStore.apiUrl}/departments/${id}`,
      {
        name: name.value,
        description: description.value,
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    )
    .then((response) => {
      console.log(response.data);
      // Refresh the department list after update
      getDepartments();
      modalUpdateOpen.value = false;
      formErrors.value = null;
      // Reset form fields
      name.value = "";
      description.value = "";
      idDepartment.value = null;

      Swal.fire({
        title: "Updated!",
        text: "Your data has been updated.",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
      });
    })
    .finally(() => {
      buttonDisabled.value = false;
    });

  console.log("Updating department:", name.value, description.value);
}

function deleteDepartment(id: number) {
  buttonDisabled.value = true;
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      axios
        .delete(`${authStore.apiUrl}/departments/${id}`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        })
        .then((response) => {
          console.log(response.data);
          // Refresh the department list after deletion
          getDepartments();

          Swal.fire({
            title: "Deleted!",
            text: "Your file has been deleted.",
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
          });
        })
        .catch((error) => {
          console.error("Error deleting department:", error);
        })
        .finally(() => {
          buttonDisabled.value = false;
        });
    }
  });
}
</script>

<template>
  <DashboardLayout
    :breadcrumbs="breadcrumbs"
    heading="Departments"
    subheading="Manage department data for users"
  >
    <section clas="w-full">
      <header class="mb-4 flex flex-col md:flex-row w-full gap-y-2 md:items-center justify-between">
        <div class="relative w-full max-w-sm items-center">
          <Input id="search" type="text" placeholder="Search..." class="pl-10" />
          <span class="absolute start-0 inset-y-0 flex items-center justify-center px-2">
            <Search class="size-6 text-muted-foreground" />
          </span>
        </div>

        <Button @click.prevent="modalCreateOpen = true" class="max-w-sm">
          <PlusCircle /> Create Department
        </Button>
      </header>

      <main>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="font-medium">Department</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Employee Count</TableHead>
              <TableHead>Created at</TableHead>
              <TableHead> Action </TableHead>
            </TableRow>
          </TableHeader>

          <!-- jika users belum diload -->
          <TableBody v-if="!departments">
            <TableRow v-for="n in 5" :key="n">
              <TableCell><Skeleton class="h-5 w-32" /></TableCell>
              <TableCell><Skeleton class="h-5 w-52" /></TableCell>
              <TableCell><Skeleton class="h-5 w-20" /></TableCell>
              <TableCell><Skeleton class="h-5 w-20" /></TableCell>
              <TableCell><Skeleton class="h-5 w-28" /></TableCell>
            </TableRow>
          </TableBody>

          <TableBody>
            <TableRow v-for="(department, index) in departments" :key="index">
              <TableCell class="font-medium"> {{ department.name }} </TableCell>
              <TableCell>{{ department.description }}</TableCell>
              <TableCell>{{ department.count }}</TableCell>
              <TableCell>{{ department.created_at }}</TableCell>
              <TableCell>
                <div class="flex gap-2">
                  <Button size="sm" @click.prevent="fillModal(department)"><Edit /></Button>
                  <Button
                    @click.prevent="deleteDepartment(department.id)"
                    size="sm"
                    variant="destructive"
                    :disabled="buttonDisabled"
                    ><Trash
                  /></Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </main>
    </section>

    <!-- modal create -->
    <Dialog v-model:open="modalCreateOpen">
      <DialogContent class="">
        <DialogHeader>
          <DialogTitle>Create new Department</DialogTitle>
          <DialogDescription>
            Make new department here. Click create when you're done.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="createDepartment">
          <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="name" class="text-right"> Name </Label>
              <Input id="name" v-model="name" required class="col-span-4" />
            </div>
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="description" class="text-right"> Description </Label>
              <Textarea
                id="description"
                placeholder="Type the description here"
                v-model="description"
                class="col-span-4"
                rows="3"
              />
            </div>
          </div>
          <!-- errors message -->
          <div v-if="formErrors" class="mb-4 rounded-md bg-red-50">
            <ul class="list-inside p-3">
              <li
                class="text-sm list-disc text-red-600"
                v-for="(error, index) in formErrors"
                :key="index"
              >
                {{ error[0] }}
              </li>
            </ul>
          </div>
          <DialogFooter>
            <Button type="submit" :disabled="buttonDisabled"> Create </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- modal update -->
    <Dialog v-model:open="modalUpdateOpen">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Department</DialogTitle>
          <DialogDescription>
            Update department here. Click update when you're done.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="idDepartment ? updateDepartment(idDepartment) : null">
          <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="name" class="text-right"> Name </Label>
              <Input id="name" v-model="name" required class="col-span-4" />
            </div>
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="description" class="text-right"> Description </Label>
              <Textarea
                id="description"
                placeholder="Type the description here"
                v-model="description"
                class="col-span-4"
                rows="3"
              />
            </div>
          </div>
          <!-- errors message -->
          <div v-if="formErrors" class="mb-4 rounded-md bg-red-50">
            <ul class="list-inside p-3">
              <li
                class="text-sm list-disc text-red-600"
                v-for="(error, index) in formErrors"
                :key="index"
              >
                {{ error[0] }}
              </li>
            </ul>
          </div>
          <DialogFooter>
            <Button type="submit" :disabled="buttonDisabled"> Save </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </DashboardLayout>
</template>
