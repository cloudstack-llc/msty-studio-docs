<script setup lang="ts">
defineProps<{ isMobile: boolean }>();
const config = useConfig();
const { versionNavigation } = useDocsVersion();
</script>

<template>
  <UiScrollArea orientation="vertical" class="relative h-full overflow-hidden py-6 pr-6 text-sm md:pr-4" type="hover">
    <DocsVersionSwitcher />
    <LayoutHeaderNavMobile v-if="isMobile" class="mb-5 border-b pb-2" />
    <LayoutSearchButton v-if="config.search.inAside" />
    <LayoutAsideTree :links="versionNavigation" :level="0" class="pt-1" />
  </UiScrollArea>
</template>
