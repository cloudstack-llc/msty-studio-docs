<template>
  <div
    v-if="!page?.body"
    class="flex h-full items-center justify-center"
  >
    <h3 class="scroll-m-20 border-r px-4 py-3 text-2xl font-semibold">
      404
    </h3>
    <span class="scroll-m-20 px-4">
      This page could not be found.
    </span>
  </div>

  <template v-else>
    <div
      v-if="page?.fullpage"
      class="px-4 py-6 md:px-8"
      :class="[config.main.padded && 'container']"
    >
      <ContentRenderer
        :key="page._id"
        :value="page"
        :data="appConfig.shadcnDocs.data"
      />
    </div>
    <main
      v-else
      class="relative py-6"
      :class="[config.toc.enable && (page.toc ?? true) && 'lg:grid lg:grid-cols-[1fr_220px] lg:gap-14 lg:py-8']"
    >
      <div class="mx-auto w-full min-w-0">
        <LayoutBreadcrumb v-if="page?.body && config.main.breadCrumb && (page.breadcrumb ?? true)" class="mb-4" />
        <LayoutTitle
          v-if="config.main.showTitle"
          :title="page?.title"
          :description="page?.description"
          :badges="page?.badges"
          :authors="page?.authors"
        />

        <Alert
          v-if="page?.body?.children?.length === 0"
          title="Empty Page"
          icon="lucide:circle-x"
        >
          Start writing in <ProseCodeInline>content/{{ page?._file }}</ProseCodeInline> to see this page taking shape.
        </Alert>

        <ContentRenderer
          v-else
          :key="page._id"
          :value="page"
          :data="appConfig.shadcnDocs.data"
          class="docs-content"
        />

        <LayoutDocsFooter />
      </div>
      <div v-if="config.toc.enable && (page.toc ?? true)" class="hidden text-sm lg:block">
        <div class="sticky top-[90px] h-[calc(100vh-3.5rem)] overflow-hidden">
          <LayoutToc :is-small="false" />
        </div>
      </div>
    </main>
  </template>
</template>

<script setup lang="ts">
const { page } = useContent();
const config = useConfig();
const appConfig = useAppConfig();

const siteBaseUrl = "https://docs.msty.studio";
const fallbackSocialImage = `${siteBaseUrl}/images/welcome-to-msty.png`;

function toAbsoluteImageUrl(src: string): string {
  if (/^https?:\/\//i.test(src)) {
    return src;
  }
  if (src.startsWith("//")) {
    return `https:${src}`;
  }
  if (src.startsWith("/")) {
    return `${siteBaseUrl}${src}`;
  }
  return `${siteBaseUrl}/${src}`;
}

const socialImage = computed(() => {
  const configuredImage = page.value?.previewImage;
  if (typeof configuredImage === "string" && configuredImage.trim().length > 0) {
    return toAbsoluteImageUrl(configuredImage.trim());
  }
  return fallbackSocialImage;
});

useSeoMeta({
  title: `${page.value?.title ?? "404"} - ${config.value.site.name}`,
  ogTitle: page.value?.title,
  description: page.value?.description,
  ogDescription: page.value?.description,
  ogImage: () => socialImage.value,
  twitterCard: "summary_large_image",
  twitterImage: () => socialImage.value,
});
</script>
