<script setup lang="ts">
import { getDocsHome } from '../utils/docsVersions';

const route = useRoute();
const { selectedVersion, docsVersions, latestDocsVersion } = useDocsVersion();
const switching = ref(false);
const open = ref(false);
const selectorId = useId();

async function switchVersion(version: string) {
  open.value = false;
  if (version === selectedVersion.value.id) return;
  const path = route.path.replace(/\/$/, '').replace(`/${selectedVersion.value.id}`, '') || '/getting-started';
  const target = `/${version}${path}`;
  const fallback = getDocsHome(version);
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
    <UiPopover v-model:open="open">
      <UiPopoverTrigger as-child>
        <UiButton
          :id="selectorId"
          variant="outline"
          :disabled="switching"
          class="w-full justify-between font-normal"
        >
          {{ selectedVersion.id }}{{ selectedVersion.id === latestDocsVersion.id ? ' (latest)' : '' }}
          <Icon name="lucide:chevrons-up-down" class="ml-2 size-4 shrink-0 text-muted-foreground" />
        </UiButton>
      </UiPopoverTrigger>
      <UiPopoverContent align="start" class="w-[--radix-popover-trigger-width] p-1">
        <UiCommand>
          <UiCommandList aria-label="Documentation version">
            <UiCommandGroup>
              <UiCommandItem v-for="option in docsVersions" :key="option.id" :value="option.id" @select="switchVersion(option.id)">
                <Icon name="lucide:check" class="mr-2 size-4" :class="selectedVersion.id === option.id ? 'opacity-100' : 'opacity-0'" />
                {{ option.id }}{{ option.id === latestDocsVersion.id ? ' (latest)' : '' }}
              </UiCommandItem>
            </UiCommandGroup>
          </UiCommandList>
        </UiCommand>
      </UiPopoverContent>
    </UiPopover>
  </div>
</template>
