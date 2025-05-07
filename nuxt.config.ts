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

  // Add default app.head configuration
  app: {
    head: {
      title: "Msty Studio Docs",
      meta: [
        // Default Open Graph / Facebook
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Msty Studio Docs" },
        { property: "og:title", content: "Msty Studio Documentation" },
        {
          property: "og:description",
          content:
            "Get started with guides and resources to maximize your conversational AI experience with Msty Studio.",
        },
        { property: "og:image", content: "https://msty.studio/og-image.png" },
        { property: "og:url", content: "https://msty.studio" },

        // Default Twitter
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@mstyapp" },
        { name: "twitter:title", content: "Msty Studio Documentation" },
        {
          name: "twitter:description",
          content:
            "Get started with guides and resources to maximize your conversational AI experience with Msty Studio.",
        },
        { name: "twitter:image", content: "https://msty.studio/og-image.png" },
      ],
    },
  },
});
