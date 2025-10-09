<script lang="ts" setup>
import UserDashboard from "../UserDashboard.vue";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
</script>

<template>
  <UserDashboard>
    <!-- heading -->
    <div>
      <h1 class="font-semibold">Attendance</h1>
      <p class="font-light text-sm">Check and review your attendance history</p>
    </div>

    <!-- body -->
    <div class="mt-5">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead> Status </TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Check in </TableHead>
            <TableHead> Check out</TableHead>
            <TableHead> Image</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell class="font-medium"> INV001 </TableCell>
            <TableCell>Paid</TableCell>
            <TableCell>Credit Card</TableCell>
            <TableCell> $250.00 </TableCell>
            <TableCell> img </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </UserDashboard>
</template>
