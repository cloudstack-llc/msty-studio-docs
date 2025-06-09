// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  extends: ["shadcn-docs-nuxt"],
  compatibilityDate: "2024-07-06",

  routeRules: {
    "/": {
      redirect: "/getting-started/onboarding",
    },
  },

  modules: ["@nuxthub/core"],

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
});
