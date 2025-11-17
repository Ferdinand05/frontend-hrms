<script lang="ts" setup>
import Navbar from "@/components/Navbar.vue";
</script>

<template>
  <Navbar />

  <main class="px-8 py-8 md:px-16 md:py-16">
    <slot />
  </main>

  <footer class="bg-gray-100 text-center py-4 mt-8 fixed bottom-0 w-full z-50">
    <p class="text-sm text-gray-600">© 2025 Ferdinand. Created with ❤️. All rights reserved.</p>
  </footer>
</template>
