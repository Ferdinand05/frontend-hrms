<script lang="ts" setup>
const props = defineProps<{
  heading: string;
  subheading?: string;
}>();
</script>

<template>
  <header class="mb-6">
    <h1 class="text-2xl md:text-3xl tracking-wide font-bold text-gray-900 dark:text-gray-100">
      {{ props.heading }}
    </h1>
    <p class="text-sm md:text-base text-gray-500 dark:text-gray-400">
      {{ props.subheading }}
    </p>
  </header>
</template>
