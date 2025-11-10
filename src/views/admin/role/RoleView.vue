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
import { ChevronDown, ChevronsUpDown, Edit, PlusCircle, Printer, Trash } from "lucide-vue-next";
import Button from "@/components/ui/button/Button.vue";
import { h, onMounted, ref } from "vue";
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
import {
  createColumnHelper,
  FlexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
  type ColumnFiltersState,
  type ExpandedState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/vue-table";
import { valueUpdater } from "@/components/ui/table/utils";
import { cn } from "@/lib/utils";
import DropdownMenu from "@/components/ui/dropdown-menu/DropdownMenu.vue";
import DropdownMenuTrigger from "@/components/ui/dropdown-menu/DropdownMenuTrigger.vue";
import DropdownMenuContent from "@/components/ui/dropdown-menu/DropdownMenuContent.vue";
import DropdownMenuCheckboxItem from "@/components/ui/dropdown-menu/DropdownMenuCheckboxItem.vue";

const authStore = useAuthStore();

const breadcrumbs: breadcrumbItem[] = [
  {
    name: "Roles",
    href: "/admin/roles",
  },
];

const roles = ref<RoleType[]>([]);
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

const columnHelper = createColumnHelper<RoleType>();
const columns = [
  columnHelper.accessor("role_name", {
    id: "role_name",
    enablePinning: true,
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Role Name", h(ChevronsUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) => {
      return h("div", { class: "capitalize" }, row.getValue("role_name"));
    },
  }),
  columnHelper.accessor("count", {
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["User Count", h(ChevronsUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) => h("div", row.original.count),
  }),
  columnHelper.accessor("created_at", {
    id: "created_at",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Created at", h(ChevronsUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) => h("div", row.getValue("created_at")),
  }),
  columnHelper.display({
    id: "actions",
    header: () => "Actions",
    cell: ({ row }) => {
      return h("div", { class: "flex gap-2" }, [
        h(Button, { size: "sm", variant: "outline", asChild: true, title: "Edit Role" }, () =>
          h(
            Button,
            {
              variant: "outline",
              onClick: () => fillModal(row.original),
            },
            h(Edit, { class: "h-4 w-4" })
          )
        ),
        h(
          Button,
          {
            variant: "destructive",
            size: "sm",
            title: "Delete Role",
            class: "hidden",
            onClick: () => deleteRole(row.original.id),
          },
          () => h(Trash, { class: "h-4 w-4" })
        ),
      ]);
    },
    enableSorting: false,
    enableHiding: false,
  }),
];

const sorting = ref<SortingState>([]);
const columnFilters = ref<ColumnFiltersState>([]);
const columnVisibility = ref<VisibilityState>({});
const rowSelection = ref({});
const expanded = ref<ExpandedState>({});

const table = useVueTable({
  data: roles,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  onSortingChange: (updaterOrValue) => valueUpdater(updaterOrValue, sorting),
  onColumnFiltersChange: (updaterOrValue) => valueUpdater(updaterOrValue, columnFilters),
  onColumnVisibilityChange: (updaterOrValue) => valueUpdater(updaterOrValue, columnVisibility),
  onRowSelectionChange: (updaterOrValue) => valueUpdater(updaterOrValue, rowSelection),
  onExpandedChange: (updaterOrValue) => valueUpdater(updaterOrValue, expanded),
  enableRowSelection: true,
  state: {
    get sorting() {
      return sorting.value;
    },
    get columnFilters() {
      return columnFilters.value;
    },
    get columnVisibility() {
      return columnVisibility.value;
    },
    get rowSelection() {
      return rowSelection.value;
    },
    get expanded() {
      return expanded.value;
    },
    columnPinning: {
      left: ["status"],
    },
  },
});
</script>

<template>
  <DashboardLayout
    :breadcrumbs="breadcrumbs"
    heading="Roles"
    subheading="Manage role data for users"
  >
    <section clas="w-full">
      <main>
        <header class="my-4">
          <div class="flex justify-end">
            <Button @click="modalCreateOpen = true">
              <PlusCircle />
              Create Role
            </Button>
          </div>
        </header>
        <div class="flex gap-2 items-center py-4 justify-between">
          <div class="flex gap-2 items-center">
            <Input
              class="w-full md:w-64 lg:w-96"
              placeholder="Search by name..."
              :model-value="table.getColumn('role_name')?.getFilterValue() as string"
              @update:model-value="table.getColumn('role_name')?.setFilterValue($event)"
            />
          </div>
          <div class="flex gap-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="outline" class="ml-auto">
                  Columns <ChevronDown class="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  v-for="column in table.getAllColumns().filter((column) => column.getCanHide())"
                  :key="column.id"
                  class="capitalize"
                  :model-value="column.getIsVisible()"
                  @update:model-value="
                  (value: boolean) => {
                    column.toggleVisibility(!!value);
                  }
                "
                >
                  {{ column.id }}
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button>Export <Printer /></Button>
          </div>
        </div>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
                <TableHead
                  v-for="header in headerGroup.headers"
                  :key="header.id"
                  :data-pinned="header.column.getIsPinned()"
                  :class="
                    cn(
                      { 'sticky bg-background/95': header.column.getIsPinned() },
                      header.column.getIsPinned() === 'left' ? 'left-0' : 'right-0'
                    )
                  "
                >
                  <FlexRender
                    v-if="!header.isPlaceholder"
                    :render="header.column.columnDef.header"
                    :props="header.getContext()"
                  />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <template v-if="table.getRowModel().rows?.length">
                <template v-for="row in table.getRowModel().rows" :key="row.id">
                  <TableRow :data-state="row.getIsSelected() && 'selected'">
                    <TableCell
                      v-for="cell in row.getVisibleCells()"
                      :key="cell.id"
                      :data-pinned="cell.column.getIsPinned()"
                      :class="
                        cn(
                          { 'sticky bg-background/95': cell.column.getIsPinned() },
                          cell.column.getIsPinned() === 'left' ? 'left-0' : 'right-0'
                        )
                      "
                    >
                      <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                    </TableCell>
                  </TableRow>
                  <TableRow v-if="row.getIsExpanded()">
                    <TableCell :colspan="row.getAllCells().length">
                      {{ JSON.stringify(row.original) }}
                    </TableCell>
                  </TableRow>
                </template>
              </template>

              <TableRow v-else>
                <TableCell :colspan="columns.length" class="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div class="flex items-center justify-end space-x-2 py-4">
          <div class="flex-1 text-sm text-muted-foreground">
            {{ table.getFilteredSelectedRowModel().rows.length }} of
            {{ table.getFilteredRowModel().rows.length }} row(s) selected.
          </div>
          <div class="space-x-2">
            <Button
              variant="outline"
              size="sm"
              :disabled="!table.getCanPreviousPage()"
              @click="table.previousPage()"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              :disabled="!table.getCanNextPage()"
              @click="table.nextPage()"
            >
              Next
            </Button>
          </div>
        </div>
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
