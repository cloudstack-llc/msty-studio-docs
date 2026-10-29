<script setup lang="ts">
const open = ref(false);
const route = useRoute();
watch(() => route.path, () => { open.value = false; });
</script>

<template>
  <UiSheet v-model:open="open">
    <UiSheetTrigger as-child>
      <UiButton variant="ghost" size="icon" class="md:hidden" aria-label="Open documentation navigation">
        <Icon name="lucide:menu" size="18" />
      </UiButton>
    </UiSheetTrigger>
    <UiSheetContent side="left" class="pr-0">
      <UiDialogTitle class="sr-only">Documentation navigation</UiDialogTitle>
      <UiDialogDescription class="sr-only">Choose a version and a guide.</UiDialogDescription>
      <LayoutHeaderLogo />
      <LayoutAside is-mobile />
    </UiSheetContent>
  </UiSheet>
</template>
