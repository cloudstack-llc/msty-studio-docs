<script setup lang="ts">
const { page, prev, next } = useContent();
const { belongsToVersion } = useDocsVersion();
const previousPage = computed(() => prev.value?._path && belongsToVersion(prev.value._path) ? prev.value : null);
const nextPage = computed(() => next.value?._path && belongsToVersion(next.value._path) ? next.value : null);
</script>

<template>
  <div v-if="page.prevNext ?? true" class="border-t pt-6 lg:flex lg:flex-row">
    <LayoutPrevNextButton :prev-next="previousPage" side="left" />
    <span class="flex-1" />
    <LayoutPrevNextButton :prev-next="nextPage" side="right" />
  </div>
</template>
