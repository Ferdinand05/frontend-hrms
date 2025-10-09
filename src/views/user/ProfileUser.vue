<script lang="ts" setup>
import Label from "@/components/ui/label/Label.vue";
import Input from "@/components/ui/input/Input.vue";
import UserDashboard from "../UserDashboard.vue";
import Button from "@/components/ui/button/Button.vue";
</script>

<template>
  <UserDashboard>
    <!-- heading -->
    <div>
      <h1 class="font-semibold">Profile</h1>
      <p class="font-light text-sm">Control your profile here</p>
    </div>
    <!-- body -->
    <div class="mt-5">
      <form action="" method="post">
        <div class="space-y-4">
          <div class="grid w-full items-center gap-1.5">
            <Label for="name">Name</Label>
            <Input id="name" type="name" placeholder="Name" />
          </div>
          <div class="grid w-full items-center gap-1.5">
            <Label for="email">Email</Label>
            <Input id="email" type="email" placeholder="Email" />
          </div>
          <div>
            <Button>Save</Button>
          </div>
        </div>
      </form>
    </div>
  </UserDashboard>
</template>
