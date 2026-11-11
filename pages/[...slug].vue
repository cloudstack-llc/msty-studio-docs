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
        <div class="mb-6 rounded-md border bg-muted/40 px-4 py-3 text-sm">
          <template v-if="isV3">Msty Studio 3.x · Desktop guide</template>
          <template v-else>
            You’re reading the 2.x documentation.
            <NuxtLink to="/v3/getting-started" class="ml-1 font-medium underline underline-offset-4">Read the 3.x guide</NuxtLink>
          </template>
        </div>
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
const route = useRoute();
const { pages } = useContentState();
// Capture the route during setup so deferred head getters do not call useRoute.
const page = computed(() => pages.value[route.path.replace(/\/$/, "")]);
const config = useConfig();
const appConfig = useAppConfig();
const runtimeConfig = useRuntimeConfig();
const { isV3, version } = useDocsVersion();

const siteBaseUrl = (runtimeConfig.public.siteUrl || "").replace(/\/$/, "");
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

const hasPageBody = computed(() => Boolean(page.value?.body));
if (import.meta.server && !hasPageBody.value) {
  setResponseStatus(404);
}

const socialImage = computed(() => {
  const image = typeof page.value?.previewImage === "string" ? page.value.previewImage.trim() : "";
  return image ? toAbsoluteImageUrl(image) : fallbackSocialImage;
});
const canonicalUrl = computed(() => {
  const path = typeof page.value?._path === "string" ? page.value._path : "";
  return hasPageBody.value && path ? `${siteBaseUrl}${path}` : undefined;
});
const searchTitle = computed(() => hasPageBody.value
  ? `${page.value?.title} - Msty Studio ${version.value} Docs`
  : "Page not found");

useHead(() => ({
  link: canonicalUrl.value ? [{ rel: "canonical", href: canonicalUrl.value }] : [],
}));

useSeoMeta({
  title: () => searchTitle.value,
  ogTitle: () => searchTitle.value,
  ogUrl: () => canonicalUrl.value,
  description: () => page.value?.description,
  ogDescription: () => page.value?.description,
  ogImage: () => socialImage.value,
  robots: () => hasPageBody.value ? "index, follow" : "noindex, nofollow",
  twitterCard: "summary_large_image",
  twitterImage: () => socialImage.value,
});
</script>
