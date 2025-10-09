<script lang="ts" setup>
import Navbar from "@/components/Navbar.vue";
</script>

<template>
  <Navbar />

  <main class="px-8 py-8 md:px-16 md:py-16">
    <slot />
  </main>
</template>
