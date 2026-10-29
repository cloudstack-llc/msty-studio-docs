<script setup lang="ts">
const { logo, title, showTitle } = useConfig().value.header;
const { home } = useDocsVersion();
</script>

<template>
  <div>
    <NuxtLink v-if="logo.light && logo.dark" :to="home" class="flex">
      <NuxtImg :src="logo.light" alt="Msty Studio" class="h-7 dark:hidden" />
      <NuxtImg :src="logo.dark" alt="Msty Studio" class="hidden h-7 dark:block" />
      <span v-if="showTitle && title" class="ml-3 self-center font-bold">{{ title }}</span>
    </NuxtLink>
  </div>
</template>
