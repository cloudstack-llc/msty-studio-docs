<script setup lang="ts">
const route = useRoute();
const { isV3 } = useDocsVersion();
const switching = ref(false);
const selectorId = useId();
const selectedVersion = computed({
  get: () => isV3.value ? '3' : '2',
  set: version => { void switchVersion(version); },
});

async function switchVersion(version: string) {
  const path = route.path.replace(/^\/v3(?=\/|$)/, '') || '/getting-started';
  const target = version === '3' ? `/v3${path}` : path;
  const fallback = version === '3' ? '/v3/getting-started' : '/getting-started';
  switching.value = true;
  try {
    const page = await queryContent().where({ _path: target }).only(['_path']).findOne();
    await navigateTo(page?._path ?? fallback);
  } catch {
    await navigateTo(fallback);
  } finally {
    switching.value = false;
  }
}
</script>

<template>
  <div class="mb-5">
    <label :for="selectorId" class="mb-2 block text-xs font-medium text-muted-foreground">Documentation version</label>
    <select
      :id="selectorId"
      v-model="selectedVersion"
      :disabled="switching"
      class="h-10 w-full rounded-md border bg-background px-3 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <option value="3">3.x</option>
      <option value="2">2.x (previous version)</option>
    </select>
  </div>
</template>
