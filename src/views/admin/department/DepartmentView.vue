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
import { ChevronDown, ChevronsUpDown, Edit, PlusCircle, Printer, Trash } from "lucide-vue-next";
import { h, onMounted, ref } from "vue";
import { useAuthStore } from "@/stores/auth";
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
import { cn } from "@/lib/utils";
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
import DropdownMenu from "@/components/ui/dropdown-menu/DropdownMenu.vue";
import DropdownMenuTrigger from "@/components/ui/dropdown-menu/DropdownMenuTrigger.vue";
import DropdownMenuContent from "@/components/ui/dropdown-menu/DropdownMenuContent.vue";
import DropdownMenuCheckboxItem from "@/components/ui/dropdown-menu/DropdownMenuCheckboxItem.vue";
import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";

const authStore = useAuthStore();
const breadcrumbs = [
  {
    name: "Departments",
    href: "/admin/departments",
  },
];

const departments = ref<Department[]>([]);
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

// tanstack table
const columnHelper = createColumnHelper<Department>();
const columns = [
  columnHelper.accessor("name", {
    id: "name",
    enablePinning: true,
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Name", h(ChevronsUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) => {
      return h("div", { class: "capitalize" }, row.getValue("name"));
    },
  }),
  columnHelper.accessor("description", {
    id: "description",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Description", h(ChevronsUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) =>
      h(
        "div",
        {
          class: "capitalize ",
        },
        row.getValue("description")
      ),
  }),
  columnHelper.accessor("count", {
    id: "count",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        },
        () => ["Employee Count", h(ChevronsUpDown, { class: "ml-2 h-4 w-4" })]
      );
    },
    cell: ({ row }) =>
      h(
        "div",
        {
          class: "capitalize ",
        },
        row.original.count
      ),
  }),
  columnHelper.display({
    id: "actions",
    header: () => "Actions",
    cell: ({ row }) => {
      return h("div", { class: "flex gap-2" }, [
        h(Button, { size: "sm", variant: "outline", asChild: true, title: "Edit Department" }, () =>
          h(
            Button,
            { variant: "outline", onClick: () => fillModal(row.original) },
            h(Edit, { class: "h-4 w-4" })
          )
        ),
        h(
          Button,
          {
            variant: "destructive",
            size: "sm",
            title: "Delete Department",
            onClick: () => deleteDepartment(row.original.id),
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
  data: departments,
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

function printDepartments() {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Header
  doc.setFontSize(14);
  doc.text("Departments Report", 105, 15, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Generated at: ${new Date().toLocaleString()}`, 105, 22, { align: "center" });

  // Table
  autoTable(doc, {
    startY: 30,
    head: [["#", "Name", "Description", "Employee Count", "Created At"]],
    body: departments.value.map((item, index) => [
      index + 1,
      item.name,
      item.description,
      item.count,
      item.created_at,
    ]),
    theme: "striped",
    headStyles: {
      fillColor: [41, 128, 185], // biru muda
      textColor: [255, 255, 255],
      halign: "center",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [33, 33, 33],
    },
    styles: {
      cellPadding: 2,
      lineWidth: 0.1,
      valign: "middle",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.text(`Generated at: ${new Date().toLocaleString()}`, 10, pageHeight - 10);
  doc.text("HRM System - Confidential", 200, pageHeight - 10, { align: "right" });

  // Save
  doc.save(`departments-report.pdf`);
}
</script>

<template>
  <DashboardLayout
    :breadcrumbs="breadcrumbs"
    heading="Departments"
    subheading="Manage department data for users"
  >
    <section clas="w-full">
      <main>
        <header class="my-4">
          <div class="flex justify-end">
            <Button @click="modalCreateOpen = true"> <PlusCircle /> Create Department</Button>
          </div>
        </header>
        <div class="flex gap-2 items-center py-4 justify-between">
          <div class="flex gap-2 items-center">
            <Input
              class="w-full md:w-64 lg:w-96"
              placeholder="Search by name..."
              :model-value="table.getColumn('name')?.getFilterValue() as string"
              @update:model-value="table.getColumn('name')?.setFilterValue($event)"
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

            <Button @click.prevent="printDepartments">Export <Printer /></Button>
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
