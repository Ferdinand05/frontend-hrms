<script lang="ts" setup>
import Button from "@/components/ui/button/Button.vue";
import Card from "@/components/ui/card/Card.vue";
import CardContent from "@/components/ui/card/CardContent.vue";
import CardDescription from "@/components/ui/card/CardDescription.vue";
import CardFooter from "@/components/ui/card/CardFooter.vue";
import CardHeader from "@/components/ui/card/CardHeader.vue";
import CardTitle from "@/components/ui/card/CardTitle.vue";
import Input from "@/components/ui/input/Input.vue";
import Label from "@/components/ui/label/Label.vue";
import { ref } from "vue";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { Loader } from "lucide-vue-next";
const email = ref("");
const password = ref("");

const authStore = useAuthStore();
const isSubmitting = ref(false);
function login() {
  isSubmitting.value = true;
  axios
    .post(`${authStore.apiUrl}/login`, {
      email: email.value,
      password: password.value,
    })
    .then((response) => {
      authStore.login(response.data.user, response.data.access_token, response.data.message);
      authStore.checkAuth();
    })
    .catch((error) => {
      console.error("There was an error!", error);
    })
    .finally(() => {
      isSubmitting.value = false;
    });
}

// check if user is authenticated, if yes redirect to home
authStore.checkAuth();
</script>

<template>
  <section class="w-full h-screen flex items-center justify-center px-4">
    <Card class="w-full max-w-sm">
      <CardHeader>
        <CardTitle class="text-2xl"> Login </CardTitle>
        <CardDescription> Enter your email below to login to your account. </CardDescription>
      </CardHeader>
      <form @submit.prevent="login()" class="grid gap-4">
        <CardContent class="grid gap-4">
          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input id="email" v-model="email" type="email" placeholder="m@example.com" required />
          </div>
          <div class="grid gap-2">
            <Label for="password">Password</Label>
            <Input id="password" v-model="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter>
          <Button class="w-full" :disabled="isSubmitting">
            <Loader class="spin-in animate-spin" v-show="isSubmitting" />
            Sign in
          </Button>
        </CardFooter>
      </form>
    </Card>
  </section>
</template>
