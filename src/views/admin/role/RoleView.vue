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
import Input from "@/components/ui/input/Input.vue";
import { Edit, PlusCircle, Search, Trash } from "lucide-vue-next";
import Button from "@/components/ui/button/Button.vue";
import Skeleton from "@/components/ui/skeleton/Skeleton.vue";
import { onMounted, ref } from "vue";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import Dialog from "@/components/ui/dialog/Dialog.vue";
import DialogContent from "@/components/ui/dialog/DialogContent.vue";
import DialogHeader from "@/components/ui/dialog/DialogHeader.vue";
import DialogTitle from "@/components/ui/dialog/DialogTitle.vue";
import DialogDescription from "@/components/ui/dialog/DialogDescription.vue";
import Label from "@/components/ui/label/Label.vue";
import DialogFooter from "@/components/ui/dialog/DialogFooter.vue";
import Swal from "sweetalert2";
import type { RoleType } from "@/types";

const authStore = useAuthStore();

const breadcrumbs: breadcrumbItem[] = [
  {
    name: "Roles",
    href: "/admin/roles",
  },
];

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
const formErrors = ref<string[][] | null>(null);
const buttonDisabled = ref(false);
const modalCreateOpen = ref(false);
const role_name = ref("");
onMounted(() => {
  getRoles();
});

function createRole() {
  buttonDisabled.value = true;
  formErrors.value = null;

  axios
    .post(
      `${authStore.apiUrl}/roles`,
      {
        role_name: role_name.value,
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    )
    .then((response) => {
      console.log("Role created:", response.data);
      // reset form
      role_name.value = "";
      modalCreateOpen.value = false;
      getRoles();
    })
    .catch((error) => {
      if (error.response && error.response.status === 422) {
        formErrors.value = error.response.data.errors;
      } else {
        console.error("Error creating role:", error);
      }
    })
    .finally(() => {
      buttonDisabled.value = false;
    });
}

// update role
const modalEditOpen = ref<boolean>(false);
const role_id = ref<number | null>(null);
function fillModal(role: RoleType) {
  role_name.value = role.role_name;
  role_id.value = role.id;
  modalEditOpen.value = true;
}

function updateRole(id: number) {
  buttonDisabled.value = true;
  formErrors.value = null;

  axios
    .put(
      `${authStore.apiUrl}/roles/${id}`,
      {
        role_name: role_name.value,
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    )
    .then((response) => {
      console.log("Role updated:", response.data);
      // reset form
      role_name.value = "";
      modalCreateOpen.value = false;
      getRoles();

      Swal.fire({
        title: "Success!",
        text: "Role has been updated.",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      });
    })
    .catch((error) => {
      if (error.response && error.response.status === 422) {
        formErrors.value = error.response.data.errors;
      } else {
        console.error("Error updating role:", error);
      }
    })
    .finally(() => {
      buttonDisabled.value = false;
      modalEditOpen.value = false;
    });
}

function deleteRole(id: number) {
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
        .delete(`${authStore.apiUrl}/roles/${id}`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        })
        .then((response) => {
          console.log("Role deleted:", response.data);
          getRoles();
          Swal.fire({
            title: "Deleted!",
            text: "Role has been deleted.",
            icon: "success",
            timer: 1200,
            showConfirmButton: false,
          });
        })
        .catch((error) => {
          console.error("Error deleting role:", error);
          Swal.fire("Error!", "There was an error deleting the role.", "error");
        });
    }
  });
}
</script>

<template>
  <DashboardLayout
    :breadcrumbs="breadcrumbs"
    heading="Roles"
    subheading="Manage role data for users"
  >
    <section clas="w-full">
      <header class="mb-4 flex flex-col md:flex-row w-full gap-y-2 md:items-center justify-between">
        <div class="relative w-full max-w-sm items-center">
          <Input id="search" type="text" placeholder="Search..." class="pl-10" />
          <span class="absolute start-0 inset-y-0 flex items-center justify-center px-2">
            <Search class="size-6 text-muted-foreground" />
          </span>
        </div>

        <Button class="max-w-sm" @click.prevent="modalCreateOpen = true">
          <PlusCircle /> Create Role
        </Button>
      </header>

      <main>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead> Role </TableHead>
              <TableHead>Count</TableHead>
              <TableHead>Created at</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <!-- jika data belum diload -->
          <TableBody v-if="!roles">
            <TableRow v-for="n in 5" :key="n">
              <TableCell><Skeleton class="h-5 w-32" /></TableCell>
              <TableCell><Skeleton class="h-5 w-40" /></TableCell>
              <TableCell><Skeleton class="h-5 w-20" /></TableCell>
              <TableCell><Skeleton class="h-5 w-28" /></TableCell>
            </TableRow>
          </TableBody>

          <TableBody>
            <TableRow v-for="role in roles" :key="role.id">
              <TableCell class="font-medium"> {{ role.role_name }} </TableCell>
              <TableCell>{{ role.count }}</TableCell>
              <TableCell>{{ role.created_at }}</TableCell>
              <TableCell>
                <div class="flex gap-2">
                  <Button size="sm" @click.prevent="fillModal(role)"><Edit /></Button>
                  <Button size="sm" variant="destructive" @click.prevent="deleteRole(role.id)"
                    ><Trash
                  /></Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </main>
    </section>

    <!-- modal create role -->
    <Dialog v-model:open="modalCreateOpen">
      <DialogContent class="">
        <DialogHeader>
          <DialogTitle>Create new Role</DialogTitle>
          <DialogDescription>
            Make new Role here. Click create when you're done.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="createRole">
          <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="role_name" class="text-right">Role Name </Label>
              <Input id="role_name" v-model="role_name" required class="col-span-4" />
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

    <!-- modal edit role -->
    <Dialog v-model:open="modalEditOpen">
      <DialogContent class="">
        <DialogHeader>
          <DialogTitle>Update Role</DialogTitle>
          <DialogDescription> Update Role here. Click save when you're done. </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="role_id ? updateRole(role_id) : null">
          <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="role_name" class="text-right">Role Name </Label>
              <Input id="role_name" v-model="role_name" required class="col-span-4" />
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
