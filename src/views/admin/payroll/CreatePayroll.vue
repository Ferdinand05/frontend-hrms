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
import { useAuthStore } from "@/stores/auth";
import type { breadcrumbItem } from "@/types/breadcrumb";
import type { EmployeeType } from "@/types/user";
import DashboardLayout from "@/views/layouts/DashboardLayout.vue";
import axios from "axios";
import { Loader } from "lucide-vue-next";
import Swal from "sweetalert2";
import { computed, onMounted, ref, watch } from "vue";

const breadcrumbs: breadcrumbItem[] = [
  {
    name: "Payroll",
    href: "/admin/payrolls",
  },
  {
    name: "Create Payroll",
    href: "/admin/payrolls/create",
  },
];
const authStore = useAuthStore();
const employees = ref<EmployeeType[]>([]);
// TODO - Tampilkan employee yg sudah punya salary sja.
function getEmployees() {
  axios
    .get(`${authStore.apiUrl}/employees-with-salary-without-payroll`, {
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

// setup create payroll
const employee_id = ref();
const period = ref<string>("");
const base_salary = ref<number>(0);
const allowance = ref<number>(0);
const overtime_rate = ref<number>(0);
const overtime_hours = ref<number>(0);
const overtime_pay = ref<number>(0);
const deduction = ref<number>(0);
const salary_id = ref();
watch(employee_id, (newVal) => {
  const selectedEmployee = employees.value.find((emp) => emp.id == newVal);

  if (selectedEmployee?.salary == null) {
    Swal.fire({
      title: "Employee dont have salary!",
      text: "Add salary to employee",
      icon: "error",
      footer: "<a href='/admin/salaries'>Create Salary</a>",
    });

    employee_id.value = "";

    return;
  }

  salary_id.value = selectedEmployee.salary.id;
  base_salary.value = selectedEmployee.salary.base_salary;
  allowance.value = selectedEmployee.salary.allowance;
  overtime_rate.value = selectedEmployee.salary.overtime_rate;
  deduction.value = selectedEmployee.salary.deduction;
});

// count overtime
watch(overtime_hours, (newVal) => {
  overtime_pay.value = newVal * overtime_rate.value;
});

const total_salary = computed(() => {
  return base_salary.value + allowance.value + overtime_pay.value - deduction.value;
});

const formErrors = ref<Record<string, string[]> | null>(null);
const buttonLoading = ref<boolean>(false);
// create payroll
function storePayroll() {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, create payroll!",
  }).then((result) => {
    if (result.isConfirmed) {
      buttonLoading.value = true;

      // store data
      axios
        .post(
          `${authStore.apiUrl}/payrolls`,
          {
            employee_id: employee_id.value,
            salary_id: salary_id.value,
            base_salary: base_salary.value,
            allowance: allowance.value,
            deduction: deduction.value,
            total_salary: total_salary.value,
            overtime_hours: overtime_hours.value,
            overtime_pay: overtime_pay.value,
            period: period.value,
          },
          {
            headers: {
              Authorization: `Bearer ${authStore.getToken}`,
            },
          }
        )
        .then((response) => {
          Swal.fire({
            title: "Success!",
            icon: "success",
            text: `${response.data.message}`,
          });

          base_salary.value = 0;
          allowance.value = 0;
          deduction.value = 0;
          overtime_hours.value = 0;
          overtime_rate.value = 0;
          overtime_pay.value = 0;
          salary_id.value = "";
          period.value = "";

          getEmployees();
        })
        .catch((error) => {
          console.log(error);

          Swal.fire({
            title: "Error!",
            icon: "error",
            text: `${error.response.data.message}`,
          });

          formErrors.value = error.response.data.errors;
        })
        .finally(() => {
          buttonLoading.value = false;
        });
    }
  });
}
</script>

<template>
  <DashboardLayout
    :breadcrumbs="breadcrumbs"
    heading="Create Payroll"
    subheading="Create new payroll for employee"
  >
    <section class="max-w-3xl">
      <form class="grid grid-cols-1 md:grid-cols-2 gap-3" v-on:submit.prevent="storePayroll">
        <div class="space-y-2">
          <Label>Employee*</Label>
          <Select v-model="employee_id" :disabled="!employees">
            <SelectTrigger class="w-full" :disabled="!employees">
              <SelectValue placeholder="Select Employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="(e, i) in employees" :key="i" :value="e.id" class="capitalize">
                  {{ e.full_name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label>Period*</Label>
          <Input type="month" v-model="period" />
        </div>
        <div class="space-y-2 col-span-2">
          <Label>Base Salary</Label>
          <Input type="number" v-model="base_salary" disabled="true" class="disabled:bg-gray-100" />
        </div>
        <div class="space-y-2">
          <Label>Allowance</Label>
          <Input type="number" v-model="allowance" disabled="true" class="disabled:bg-gray-100" />
        </div>
        <div class="space-y-2">
          <Label>Overtime Rate</Label>
          <Input
            type="number"
            v-model="overtime_rate"
            disabled="true"
            class="disabled:bg-gray-100"
          />
        </div>
        <div class="space-y-2">
          <Label>Overtime Hours*</Label>
          <Input type="number" placeholder="How many hours ?" v-model="overtime_hours" />
        </div>
        <div class="space-y-2">
          <Label>Overtime Pay</Label>
          <Input
            type="number"
            v-model="overtime_pay"
            disabled="true"
            class="disabled:bg-gray-100"
          />
        </div>
        <div class="space-y-2">
          <Label>Deduction</Label>
          <Input type="number" v-model="deduction" disabled="true" class="disabled:bg-gray-100" />
        </div>
        <div class="space-y-2">
          <Label>Total Salary</Label>
          <Input
            type="number"
            v-model="total_salary"
            disabled="true"
            class="disabled:bg-gray-100"
          />
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

        <div class="flex justify-end md:col-start-2">
          <Button type="submit" :disabled="buttonLoading"
            ><Loader class="spin animate-spin transition-all" v-if="buttonLoading" /> Submit</Button
          >
        </div>
      </form>
    </section>
  </DashboardLayout>
</template>
