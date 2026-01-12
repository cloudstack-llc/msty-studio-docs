// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  extends: ["shadcn-docs-nuxt"],
  compatibilityDate: "2024-09-19",

  routeRules: {
    "/": {
      redirect: "/getting-started",
    },
  },

  nitro: {
    preset: "cloudflare_pages",
  },

  components: {
    dirs: [
      "~/components",
      "~/components/ui",
      {
        path: "~/components/content",
        prefix: "",
      },
    ],
  },

  alias: {
    "@": "/<rootDir>",
  },
});
