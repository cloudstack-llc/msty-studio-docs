<script setup lang="ts">
const route = useRoute();
const { isV3 } = useDocsVersion();
const switching = ref(false);
const open = ref(false);
const selectorId = useId();

async function switchVersion(version: string) {
  open.value = false;
  if (version === (isV3.value ? '3' : '2')) return;
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
    <UiPopover v-model:open="open">
      <UiPopoverTrigger as-child>
        <UiButton
          :id="selectorId"
          variant="outline"
          :disabled="switching"
          class="w-full justify-between font-normal"
        >
          {{ isV3 ? '3.x' : '2.x (previous version)' }}
          <Icon name="lucide:chevrons-up-down" class="ml-2 size-4 shrink-0 text-muted-foreground" />
        </UiButton>
      </UiPopoverTrigger>
      <UiPopoverContent align="start" class="w-[--radix-popover-trigger-width] p-1">
        <UiCommand>
          <UiCommandList aria-label="Documentation version">
            <UiCommandGroup>
              <UiCommandItem value="3" @select="switchVersion('3')">
                <Icon name="lucide:check" class="mr-2 size-4" :class="isV3 ? 'opacity-100' : 'opacity-0'" />
                3.x
              </UiCommandItem>
              <UiCommandItem value="2" @select="switchVersion('2')">
                <Icon name="lucide:check" class="mr-2 size-4" :class="isV3 ? 'opacity-0' : 'opacity-100'" />
                2.x (previous version)
              </UiCommandItem>
            </UiCommandGroup>
          </UiCommandList>
        </UiCommand>
      </UiPopoverContent>
    </UiPopover>
  </div>
</template>
