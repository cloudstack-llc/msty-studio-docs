<template>
  <div
    v-if="page.resources?.videos?.length || page.resources?.blogs?.length"
    class="mt-8"
  >
    <h2
      :id="id"
      class="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors [&:not(:first-child)]:mt-10"
    >
      <NuxtLink
        :to="`#${id}`"
        class="text-inherit no-underline hover:no-underline hover:cursor-pointer"
      >
        Related Resources
      </NuxtLink>
    </h2>

    <!-- Videos Section -->
    <div v-if="page.resources?.videos?.length" class="mt-6 mb-8">
      <h3
        class="scroll-m-20 text-2xl font-semibold tracking-tight [&:not(:first-child)]:mt-8"
      >
        Videos
      </h3>
      <div class="relative group mt-4">
        <button
          v-show="canScrollLeft.videos"
          @click="scrollLeft('videos')"
          class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div
          ref="videosContainer"
          class="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-hide"
          @scroll="handleScroll('videos')"
        >
          <div
            v-for="videoId in page.resources.videos"
            :key="videoId"
            class="flex-none w-[340px]"
          >
            <div
              class="rounded-lg border bg-white shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200 overflow-hidden"
            >
              <a
                :href="`https://youtube.com/watch?v=${videoId}`"
                target="_blank"
                rel="noopener noreferrer"
                class="block"
              >
                <div class="relative pt-[56.25%] overflow-hidden rounded-t-lg">
                  <img
                    :src="`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`"
                    :alt="`YouTube video ${videoId}`"
                    class="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </a>
            </div>
          </div>
        </div>
        <button
          v-show="canScrollRight.videos"
          @click="scrollRight('videos')"
          class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Blogs Section -->
    <div v-if="page.resources?.blogs?.length" class="mb-8">
      <h3
        class="scroll-m-20 text-2xl font-semibold tracking-tight [&:not(:first-child)]:mt-8"
      >
        Blog Posts
      </h3>
      <div class="relative group mt-4">
        <button
          v-show="canScrollLeft.blogs"
          @click="scrollLeft('blogs')"
          class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div
          ref="blogsContainer"
          class="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-hide"
          @scroll="handleScroll('blogs')"
        >
          <div
            v-for="blog in page.resources.blogs"
            :key="blog.url"
            class="flex-none w-80"
          >
            <div
              class="rounded-lg border bg-white shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200"
            >
              <a
                :href="blog.url"
                target="_blank"
                rel="noopener noreferrer"
                class="block"
              >
                <img
                  :src="blog.image"
                  :alt="blog.title"
                  class="w-full h-48 object-cover rounded-t-lg"
                />
                <div class="p-4">
                  <h4 class="font-semibold mb-2">{{ blog.title }}</h4>
                  <p class="text-sm text-gray-600">{{ blog.description }}</p>
                </div>
              </a>
            </div>
          </div>
        </div>
        <button
          v-show="canScrollRight.blogs"
          @click="scrollRight('blogs')"
          class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from "vue";

const { page } = useContent();

const id = computed(() => "related-resources");

const videosContainer = ref<HTMLElement | null>(null);
const blogsContainer = ref<HTMLElement | null>(null);

const canScrollLeft = reactive({
  videos: false,
  blogs: false,
});

const canScrollRight = reactive({
  videos: false,
  blogs: false,
});

const checkScroll = (
  container: HTMLElement | null,
  type: "videos" | "blogs"
) => {
  if (!container) return;

  // Check if we're at the start (allowing for a small threshold)
  canScrollLeft[type] = container.scrollLeft > 10;

  // Check if we're at the end (allowing for a small threshold)
  const isAtEnd =
    container.scrollLeft + container.clientWidth >= container.scrollWidth - 10;
  canScrollRight[type] = !isAtEnd;
};

const handleScroll = (type: "videos" | "blogs") => {
  const container =
    type === "videos" ? videosContainer.value : blogsContainer.value;
  checkScroll(container, type);
};

const scrollLeft = (type: "videos" | "blogs") => {
  const container =
    type === "videos" ? videosContainer.value : blogsContainer.value;
  if (!container) return;

  container.scrollBy({
    left: -container.clientWidth,
    behavior: "smooth",
  });
};

const scrollRight = (type: "videos" | "blogs") => {
  const container =
    type === "videos" ? videosContainer.value : blogsContainer.value;
  if (!container) return;

  container.scrollBy({
    left: container.clientWidth,
    behavior: "smooth",
  });
};

onMounted(async () => {
  if (page.value.resources?.videos?.length) {
    const { $youtube } = useNuxtApp();
    // Initial check
    checkScroll(videosContainer.value, "videos");
    checkScroll(blogsContainer.value, "blogs");

    // Add resize observer to handle window resizing
    const resizeObserver = new ResizeObserver(() => {
      checkScroll(videosContainer.value, "videos");
      checkScroll(blogsContainer.value, "blogs");
    });

    if (videosContainer.value) resizeObserver.observe(videosContainer.value);
    if (blogsContainer.value) resizeObserver.observe(blogsContainer.value);
  }
});
</script>

<style>
.scrollbar-hide {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
.scrollbar-hide::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}
</style>
