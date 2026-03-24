const watchIgnored = [
  "**/.git/**",
  "**/.nuxt/**",
  "**/.output/**",
  "**/.data/**",
  "**/dist/**",
  "**/node_modules/**",
  "**/.pnpm-store/**",
];

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
      ignored: watchIgnored,
      usePolling: true,
      interval: 250,
    },
  },

  vite: {
    server: {
      watch: {
        ignored: watchIgnored,
        usePolling: true,
        interval: 250,
      },
    },
  },

  alias: {
    "@": "/<rootDir>",
  },
});
