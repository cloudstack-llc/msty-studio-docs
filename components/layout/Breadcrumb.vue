<template>
  <UiBreadcrumb>
    <UiBreadcrumbList>
      <template v-for="(breadcrumb, index) in breadcrumbs" :key="breadcrumb.href ?? breadcrumb.title">
        <UiBreadcrumbItem>
          <NuxtLink
            v-if="index !== breadcrumbs.length - 1 && pagePaths.has(breadcrumb.href)"
            :to="breadcrumb.href"
            class="transition-colors hover:text-foreground"
          >{{ breadcrumb.title }}</NuxtLink>
          <span v-else :aria-current="index === breadcrumbs.length - 1 ? 'page' : undefined"
            :class="{ 'text-foreground': index === breadcrumbs.length - 1 }">
            {{ breadcrumb.title }}
          </span>
        </UiBreadcrumbItem>
        <UiBreadcrumbSeparator v-if="index !== breadcrumbs.length - 1" />
      </template>
    </UiBreadcrumbList>
  </UiBreadcrumb>
</template>

<script setup lang="ts">
const route = useRoute();
const appConfig = useAppConfig();
const pagePaths = new Set(appConfig.contentPagePaths);
const breadcrumbs = computed(() => useBreadcrumb(route.path));
</script>
