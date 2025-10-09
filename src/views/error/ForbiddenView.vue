<script lang="ts" setup>
import { XCircle } from "lucide-vue-next";
</script>

<template>
  <section class="w-full h-screen flex items-center justify-center px-4">
    <div class="text-center">
      <h1 class="text-6xl font-bold mb-4">404</h1>
      <p class="text-xl mb-4">The route you are looking for was not found</p>
      <div class="text-red-600 mb-8 mx-auto w-16 h-16">
        <XCircle class="size-16" />
      </div>
      <div class="">
        <router-link to="/" class="btn btn-primary">Go to Home</router-link>
      </div>
    </div>
  </section>
</template>
