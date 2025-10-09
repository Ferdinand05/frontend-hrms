<script lang="ts" setup>
import Table from "@/components/ui/table/Table.vue";
import UserDashboard from "../UserDashboard.vue";
import TableHeader from "@/components/ui/table/TableHeader.vue";
import TableRow from "@/components/ui/table/TableRow.vue";
import TableHead from "@/components/ui/table/TableHead.vue";
import TableBody from "@/components/ui/table/TableBody.vue";
import TableCell from "@/components/ui/table/TableCell.vue";
</script>

<template>
  <UserDashboard>
    <!-- heading -->
    <div>
      <h1 class="font-semibold">Leave</h1>
      <p class="font-light text-sm">Check and view your leave history</p>
    </div>

    <!-- body -->
    <div class="mt-5">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead> Status </TableHead>
            <TableHead>Leave Type</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Approved by</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell class="font-medium"> INV001 </TableCell>
            <TableCell>Paid</TableCell>
            <TableCell>Credit Card</TableCell>
            <TableCell> $250.00 </TableCell>
            <TableCell> $250.00 </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </UserDashboard>
</template>
