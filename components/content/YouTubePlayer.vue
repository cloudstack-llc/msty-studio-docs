<script setup lang="ts">
interface Props {
  videoId: string
}

const { videoId } = defineProps<Props>()
</script>

<template>
  <div class="relative w-full" style="padding-bottom: 56.25%;">
    <ClientOnly>
      <iframe
        :src="`https://www.youtube.com/embed/${videoId}`"
        class="absolute top-0 left-0 w-full h-full rounded-lg"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </ClientOnly>
  </div>
</template>
