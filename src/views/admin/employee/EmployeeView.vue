<script lang="ts" setup>
import Button from "@/components/ui/button/Button.vue";
import Input from "@/components/ui/input/Input.vue";
import Table from "@/components/ui/table/Table.vue";
import TableBody from "@/components/ui/table/TableBody.vue";
import TableCell from "@/components/ui/table/TableCell.vue";
import TableHead from "@/components/ui/table/TableHead.vue";
import TableHeader from "@/components/ui/table/TableHeader.vue";
import TableRow from "@/components/ui/table/TableRow.vue";
import type { breadcrumbItem } from "@/types/breadcrumb";
import DashboardLayout from "@/views/layouts/DashboardLayout.vue";
import {
  ChevronDown,
  ChevronsUpDown,
  Edit,
  Eye,
  PlusCircle,
  Printer,
  Trash,
} from "lucide-vue-next";
import axios from "axios";
import { computed, h, onMounted, ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import type { EmployeeType } from "@/types/user";

import Dialog from "@/components/ui/dialog/Dialog.vue";
import DialogContent from "@/components/ui/dialog/DialogContent.vue";
import DialogDescription from "@/components/ui/dialog/DialogDescription.vue";
import DialogFooter from "@/components/ui/dialog/DialogFooter.vue";
import DialogHeader from "@/components/ui/dialog/DialogHeader.vue";
import DialogTitle from "@/components/ui/dialog/DialogTitle.vue";

import Swal from "sweetalert2";
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
import Checkbox from "@/components/ui/checkbox/Checkbox.vue";
import { valueUpdater } from "@/components/ui/table/utils";
import { cn } from "@/lib/utils";
import DropdownMenu from "@/components/ui/dropdown-menu/DropdownMenu.vue";
import DropdownMenuTrigger from "@/components/ui/dropdown-menu/DropdownMenuTrigger.vue";
import DropdownMenuContent from "@/components/ui/dropdown-menu/DropdownMenuContent.vue";
import DropdownMenuCheckboxItem from "@/components/ui/dropdown-menu/DropdownMenuCheckboxItem.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import DropdownMenuLabel from "@/components/ui/dropdown-menu/DropdownMenuLabel.vue";
import DropdownMenuSeparator from "@/components/ui/dropdown-menu/DropdownMenuSeparator.vue";
import { RouterLink } from "vue-router";
const authStore = useAuthStore();
const breadcrumbs: breadcrumbItem[] = [
  {
    name: "Employee",
    href: "/admin/employees",
  },
];

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
  getEmployees();
});

function deleteEmployee(id: number) {
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
        .delete(`${authStore.apiUrl}/employees/${id}`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        })
        .then(() => {
          Swal.fire("Deleted!", "Employee has been deleted.", "success");
          getEmployees();
        })
        .catch((error) => {
          console.error("Error deleting employee:", error);
          Swal.fire("Error!", "There was an error deleting the employee.", "error");
        });
    }
  });
}
const imageUrl = "http://localhost:8000/storage/";
const columnHelper = createColumnHelper<EmployeeType>();
const columns = [
  columnHelper.display({
    id: "select",
    header: ({ table }) =>
      h(Checkbox, {
        modelValue:
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate"),
        "onUpdate:modelValue": (value) => table.toggleAllPageRowsSelected(!!value),
        ariaLabel: "Select all",
      }),
    cell: ({ row }) => {
      return h(Checkbox, {
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (value) => row.toggleSelected(!!value),
        ariaLabel: "Select row",
      });
    },
    enableSorting: false,
    enableHiding: false,
  }),
  columnHelper.accessor("status", {
    enablePinning: true,
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Status", h(ChevronsUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) =>
      h(
        Badge,
        {
          class: "capitalize",
          variant: row.original.status == "active" ? "default" : "destructive",
        },
        row.getValue("status")
      ),
  }),
  columnHelper.accessor("employee_code", {
    header: () => h("div", "Employee Code"),
    cell: ({ row }) => {
      return h("div", { class: "font-medium" }, row.getValue("employee_code"));
    },
  }),
  columnHelper.accessor("avatar", {
    header: () => h("div", "Avatar"),
    cell: ({ row }) => {
      return h(
        "img",
        {
          class: "w-12 h-12 rounded-full object-cover object-top border border-gray-200",
          src: row.original.avatar
            ? imageUrl + row.original.avatar
            : imageUrl + "avatars/no_avatar.png",
        },
        row.getValue("avatar")
      );
    },
  }),
  columnHelper.accessor("full_name", {
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Full Name", h(ChevronsUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) => h("div", row.getValue("full_name")),
  }),
  columnHelper.accessor("position", {
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Position", h(ChevronsUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) => h("div", row.getValue("position")),
  }),
  columnHelper.accessor("department", {
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Department", h(ChevronsUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) => {
      return h("div", row.original.department ? row.original.department.name : "");
    },
  }),
  columnHelper.accessor("hire_date", {
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Hire Date", h(ChevronsUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) => h("div", row.getValue("hire_date")),
  }),
  columnHelper.display({
    id: "actions",
    header: () => "Actions",
    cell: ({ row }) => {
      return h("div", { class: "flex gap-2" }, [
        h(Button, { size: "sm", asChild: true, title: "Detail Employee" }, () =>
          h(
            Button,
            { variant: "secondary", onClick: () => openAndFillModal(row.original) },
            h(Eye, { class: "h-4 w-4" })
          )
        ),
        h(Button, { variant: "outline", size: "sm", asChild: true, title: "Edit Employee" }, () =>
          h(
            RouterLink,
            { to: `/admin/employees/${row.original.id}/edit` },
            h(Edit, { class: "h-4 w-4" })
          )
        ),
        h(
          Button,
          {
            variant: "destructive",
            size: "sm",
            title: "Delete Employee",
            onClick: () => deleteEmployee(row.original.id),
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

const selectedData = computed(() => {
  return Object.entries(rowSelection.value).map(function (id) {
    const data = table.getRow(id[0]);
    return data.original.id;
  });
});

function selectionSetActive() {
  Swal.fire({
    title: "Set status to Active",
    text: "Do you want to set status to Active?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Change!",
  }).then((result) => {
    if (result.isConfirmed) {
      axios
        .post(
          `${authStore.apiUrl}/employees/set-active`,
          {
            selectionId: selectedData.value,
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
            icon: "success",
            title: "Success",
            text: `${response.data.message}`,
            timer: 1200,
            showConfirmButton: false,
          });

          rowSelection.value = {};
          getEmployees();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  });
}

function selectionSetInactive() {
  Swal.fire({
    title: "Set to Inactive",
    text: "Do you want to set status to Inactive ?!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Change",
  }).then((result) => {
    if (result.isConfirmed) {
      axios
        .post(
          `${authStore.apiUrl}/employees/set-inactive`,
          {
            selectionId: selectedData.value,
          },
          {
            headers: {
              Authorization: `Bearer ${authStore.getToken}`,
            },
          }
        )
        .then((response) => {
          console.log(response.data);
          rowSelection.value = {};

          Swal.fire({
            icon: "success",
            title: "Success",
            text: `${response.data.message}`,
            timer: 1200,
            showConfirmButton: false,
          });

          getEmployees();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  });
}

function bulkDelete() {
  Swal.fire({
    title: "Bulk Delete",
    text: "Do you want to delete data ?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Delete it",
  }).then((result) => {
    if (result.isConfirmed) {
      axios
        .post(
          `${authStore.apiUrl}/employees/bulk-delete`,
          {
            selectionId: selectedData.value,
          },
          {
            headers: {
              Authorization: `Bearer ${authStore.getToken}`,
            },
          }
        )
        .then((response) => {
          console.log(response.data);

          rowSelection.value = {};

          Swal.fire({
            icon: "success",
            title: "Success",
            text: `${response.data.message}`,
            timer: 1200,
            showConfirmButton: false,
          });

          getEmployees();
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  });
}

const table = useVueTable({
  data: employees,
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

const openModalEmployee = ref<boolean>(false);
const detailEmployee = ref<EmployeeType | null>(null);

const openAndFillModal = (employee: EmployeeType) => {
  detailEmployee.value = employee;
  openModalEmployee.value = true;
};
</script>

<template>
  <DashboardLayout
    :breadcrumbs="breadcrumbs"
    heading="Employee Management"
    subheading="Manage all employees"
  >
    <section clas="w-full">
      <header class="mb-4 flex flex-col md:flex-row w-full gap-y-2 md:items-center justify-end">
        <RouterLink to="/admin/employees/create">
          <Button> <PlusCircle /> Add New Employee </Button>
        </RouterLink>
      </header>

      <main>
        <div class="flex gap-2 items-center py-4">
          <div class="flex gap-2 items-center">
            <Input
              class="w-full md:w-64 lg:w-96"
              placeholder="Search by name..."
              :model-value="table.getColumn('full_name')?.getFilterValue() as string"
              @update:model-value="table.getColumn('full_name')?.setFilterValue($event)"
            />
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  as-child
                  v-show="table.getFilteredSelectedRowModel().rows.length > 0"
                >
                  <Button variant="secondary"> Bulk Action </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="w-56">
                  <DropdownMenuLabel>Set Status for selected row</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    class="hover:cursor-pointer"
                    @click.prevent="selectionSetActive()"
                  >
                    <Badge>Active</Badge>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    class="hover:cursor-pointer"
                    @click.prevent="selectionSetInactive()"
                  >
                    <Badge variant="destructive">Inactive</Badge>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    class="hover:cursor-pointer"
                    @click.prevent="bulkDelete()"
                  >
                    <Button variant="ghost" class="">
                      <Trash class="mr-2 h-4 w-4" /> Delete Selection
                    </Button>
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
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

    <!-- modal detail employee -->

    <Dialog v-model:open="openModalEmployee">
      <DialogContent class="w-full md:max-w-2xl rounded-2xl shadow-xl p-6">
        <DialogHeader class="border-b pb-3 mb-4">
          <DialogTitle class="text-2xl font-semibold text-gray-800"> Detail Employee </DialogTitle>
          <DialogDescription class="text-gray-500 text-sm">
            Detailed information for this employee
          </DialogDescription>
        </DialogHeader>

        <!-- Body -->
        <section class="flex flex-col md:flex-row gap-6">
          <!-- Avatar -->
          <div
            class="w-36 h-40 rounded-lg overflow-hidden shadow-md border border-gray-200 flex-shrink-0 bg-gray-50"
          >
            <img
              :src="imageUrl + detailEmployee?.avatar"
              alt="Employee Photo"
              class="w-full h-full object-cover object-top"
            />
          </div>

          <!-- Employee Info -->
          <div class="flex-1 space-y-3 text-sm md:text-base text-gray-700">
            <h3 class="text-xl font-semibold capitalize text-gray-900">
              {{ detailEmployee?.full_name }}
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              <p>
                <span class="font-medium text-gray-600">Gender:</span> {{ detailEmployee?.gender }}
              </p>
              <p>
                <span class="font-medium text-gray-600">Code:</span>
                {{ detailEmployee?.employee_code }}
              </p>
              <p>
                <span class="font-medium text-gray-600">Position:</span>
                {{ detailEmployee?.position }}
              </p>
              <p>
                <span class="font-medium text-gray-600">Department:</span>
                {{ detailEmployee?.department?.name }}
              </p>
              <p>
                <span class="font-medium text-gray-600">Date of Birth:</span>
                {{ detailEmployee?.date_of_birth }}
              </p>
              <p>
                <span class="font-medium text-gray-600">Hire Date:</span>
                {{ detailEmployee?.hire_date }}
              </p>
              <p>
                <span class="font-medium text-gray-600">Phone:</span> {{ detailEmployee?.phone }}
              </p>
              <p class="flex gap-x-2">
                <span class="font-medium text-gray-600">Status:</span>
                <Badge
                  class="capitalize"
                  :variant="detailEmployee?.status == 'active' ? 'default' : 'destructive'"
                  >{{ detailEmployee?.status }}</Badge
                >
              </p>
            </div>
            <div class="mt-2">
              <p>
                <span class="font-medium text-gray-600">Address:</span><br />
                <span class="block text-gray-800 mt-1">{{ detailEmployee?.address }}</span>
              </p>
            </div>
          </div>
        </section>

        <!-- Footer -->
        <DialogFooter class="mt-6 border-t pt-3 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            class="border-gray-300 text-gray-600 hover:bg-gray-100"
            @click="openModalEmployee = false"
          >
            Close
          </Button>
          <Button type="submit"> <Printer class="size-4" /> Print </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </DashboardLayout>
</template>
