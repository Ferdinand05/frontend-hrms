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
import { Edit, Eye, PlusCircle, Search, Trash } from "lucide-vue-next";
import axios from "axios";
import { onMounted, ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import type { EmployeeType } from "@/types/user";
import Select from "@/components/ui/select/Select.vue";
import SelectTrigger from "@/components/ui/select/SelectTrigger.vue";
import SelectValue from "@/components/ui/select/SelectValue.vue";
import SelectContent from "@/components/ui/select/SelectContent.vue";
import SelectGroup from "@/components/ui/select/SelectGroup.vue";
import SelectItem from "@/components/ui/select/SelectItem.vue";
import Skeleton from "@/components/ui/skeleton/Skeleton.vue";
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
const statusSelect = [
  { label: "Active", value: "active" },
  { label: "Resigned", value: "resigned" },
  { label: "Probation", value: "probation" },
  { label: "Intern", value: "intern" },
];

const selectedStatus = ref("");
function onStatusChange(value: string) {
  selectedStatus.value = value;
  console.log("Selected status:", selectedStatus.value);
}
</script>

<template>
  <DashboardLayout
    :breadcrumbs="breadcrumbs"
    heading="Employee Management"
    subheading="Manage all employees"
  >
    <section clas="w-full">
      <header class="mb-4 flex flex-col md:flex-row w-full gap-y-2 md:items-center justify-between">
        <div class="relative w-full max-w-sm items-center">
          <Input id="search" type="text" placeholder="Search..." class="pl-10" />
          <span class="absolute start-0 inset-y-0 flex items-center justify-center px-2">
            <Search class="size-6 text-muted-foreground" />
          </span>
        </div>

        <Button>
          <PlusCircle />
          <RouterLink to="/admin/employees/create"> Add New Employee </RouterLink>
        </Button>
      </header>

      <main>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Employee Code</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Hire Date</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <!-- jika data employee belum diload -->
          <TableBody v-if="!employees.length">
            <TableRow v-for="n in 5" :key="n">
              <TableCell><Skeleton class="h-5 w-20" /></TableCell>
              <TableCell><Skeleton class="h-5 w-32" /></TableCell>
              <TableCell><Skeleton class="h-5 w-20" /></TableCell>
              <TableCell><Skeleton class="h-5 w-32" /></TableCell>
              <TableCell><Skeleton class="h-5 w-24" /></TableCell>
              <TableCell><Skeleton class="h-5 w-24" /></TableCell>
              <TableCell><Skeleton class="h-5 w-24" /></TableCell>
            </TableRow>
          </TableBody>

          <TableBody>
            <TableRow v-for="(employee, index) in employees" :key="index">
              <TableCell>
                <Select
                  v-model="employee.status"
                  @update:model-value="onStatusChange(employee.status)"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem
                        v-for="(status, index) in statusSelect"
                        :key="index"
                        :value="status.value"
                      >
                        {{ status.label }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{{ employee.employee_code }}</TableCell>
              <TableCell>{{ employee.full_name }}</TableCell>
              <TableCell>{{ employee.position }}</TableCell>
              <TableCell>{{ employee.department?.name }}</TableCell>
              <TableCell>{{ employee.hire_date }}</TableCell>
              <TableCell>
                <div class="flex gap-2">
                  <Button size="sm"><Eye /></Button>
                  <Button size="sm"><Edit /></Button>
                  <Button size="sm" variant="destructive"><Trash /></Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </main>
    </section>
  </DashboardLayout>
</template>
