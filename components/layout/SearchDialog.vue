<script setup lang="ts">
const open = defineModel<boolean>('open');
const { version, versionNavigation, belongsToVersion } = useDocsVersion();
const input = ref('');
const results = ref<Array<{ id: string; title: string; titles?: string[]; content?: string }>>([]);
const loading = ref(false);

watch([input, version], async () => {
  const query = input.value.trim();
  results.value = [];
  loading.value = false;
  if (!query) return;
  loading.value = true;
  try {
    const found = (await searchContent(query)).value ?? [];
    if (query === input.value.trim()) {
      const paths = new Set<string>();
      results.value = found.filter(item => {
        const path = item.id.split('#')[0];
        if (!belongsToVersion(path) || paths.has(path)) return false;
        paths.add(path);
        return true;
      }).slice(0, 20);
    }
  } catch {
    if (query === input.value.trim()) results.value = [];
  } finally {
    if (query === input.value.trim()) loading.value = false;
  }
});

watch(open, () => { input.value = ''; });
const { Meta_K, Ctrl_K } = useMagicKeys({
  passive: false,
  onEventFired(event) {
    if (event.key === 'k' && (event.metaKey || event.ctrlKey)) event.preventDefault();
  },
});
watch([Meta_K, Ctrl_K], keys => { if (keys.some(Boolean)) open.value = true; });

async function openPage(path: string) {
  open.value = false;
  await navigateTo(path);
}
const route = useRoute();
watch(() => route.path, () => { open.value = false; });
</script>

<template>
  <UiDialog v-model:open="open">
    <UiDialogContent class="p-0">
      <UiDialogTitle class="sr-only">Search {{ version }} documentation</UiDialogTitle>
      <UiDialogDescription class="sr-only">Find a guide in the selected documentation version.</UiDialogDescription>
      <UiCommand v-model:search-term="input" :filter-function="items => items" class="h-[min(70vh,450px)]">
        <UiCommandInput :loading="loading" :placeholder="`Search ${version} documentation…`" />
        <UiCommandList @escape-key-down="open = false">
          <template v-if="!input.trim()">
            <template v-for="group in versionNavigation" :key="group._path">
              <UiCommandGroup v-if="group.children?.length" :heading="group.title">
                <UiCommandItem v-for="item in group.children" :key="item._path" :value="item._path" @select="openPage(item._path)">{{ item.title }}</UiCommandItem>
              </UiCommandGroup>
              <UiCommandItem v-else :value="group._path" @select="openPage(group._path)">{{ group.title }}</UiCommandItem>
            </template>
          </template>
          <div v-else-if="results.length" class="p-2">
            <UiCommandItem v-for="item in results" :key="item.id" :value="item.id" class="block p-3" @select="openPage(item.id)">
              <span class="block text-sm font-medium">{{ item.title }}</span>
              <span v-if="item.content" class="mt-1 block truncate text-xs text-muted-foreground">{{ item.content }}</span>
            </UiCommandItem>
          </div>
          <p v-else class="p-6 text-center text-sm text-muted-foreground">{{ loading ? 'Searching…' : 'No results in this version.' }}</p>
        </UiCommandList>
      </UiCommand>
    </UiDialogContent>
  </UiDialog>
</template>
