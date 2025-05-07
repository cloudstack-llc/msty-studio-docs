<script setup>
import { usePageMetadata } from "~/composables/usePageMetadata";

// Initialize the metadata
usePageMetadata();
</script>

<template>
  <div>
    <slot />
  </div>
</template>
