// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  extends: ["shadcn-docs-nuxt"],
  compatibilityDate: "2024-09-19",

  content: {
    watch: false,
  },

  components: {
    dirs: [
      {
        path: "./node_modules/shadcn-docs-nuxt/components",
        ignore: ["ui/**", "**/*.ts"],
      },
      {
        path: "~/components",
      },
      "~/components/ui",
      {
        path: "~/components/content",
        prefix: "",
      },
    ],
  },

  routeRules: {
    "/": {
      redirect: "/getting-started",
    },
  },

  nitro: {
    preset: "cloudflare_pages",
  },

  watchers: {
    chokidar: {
      usePolling: true,
      interval: 250,
      ignored: watchIgnoredGlobs,
    },
  },

  vite: {
    server: {
      watch: {
        usePolling: true,
        interval: 250,
        ignored: watchIgnoredGlobs,
      },
    },
  },
  alias: {
    "@": "/<rootDir>",
  },
});
