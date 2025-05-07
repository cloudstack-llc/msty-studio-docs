import { useRoute } from "vue-router";
import { useHead } from "#head";

export const usePageMetadata = () => {
  const route = useRoute();

  // Get the current page's frontmatter from the route meta
  const frontmatter = route.meta.frontmatter || {};

  // Default values
  const defaults = {
    title: "Msty Studio Docs",
    description:
      "Get started with guides and resources to maximize your conversational AI experience with Msty Studio.",
    image: "https://msty.studio/og-image.png", // Replace with your default OG image
    siteName: "Msty Studio Docs",
    twitterHandle: "@mstyapp", // Replace with your Twitter handle
  };

  // Use frontmatter values if available, otherwise use defaults
  const title = frontmatter.title || defaults.title;
  const description = frontmatter.description || defaults.description;
  const image = frontmatter.ogImage || defaults.image;
  const siteName = defaults.siteName;
  const twitterHandle = defaults.twitterHandle;

  // Construct the full title
  const fullTitle = `${title} - ${siteName}`;

  // Set the metadata
  useHead({
    title: fullTitle,
    meta: [
      // Open Graph / Facebook
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: siteName },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:image", content: image },
      { property: "og:url", content: `https://msty.studio${route.path}` },

      // Twitter
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: twitterHandle },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
  });
};
