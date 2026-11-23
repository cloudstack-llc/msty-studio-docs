import { existsSync, readdirSync, statSync } from "node:fs";
import { access, mkdir, writeFile } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";
import { docsVersions, getDocsHome, latestDocsHome } from "./utils/docsVersions";

const watchIgnored = [
  "**/.git/**",
  "**/.nuxt/**",
  "**/.output/**",
  "**/.data/**",
  "**/dist/**",
  "**/node_modules/**",
  "**/.pnpm-store/**",
];

const defaultSiteUrl = "https://docs.msty.ai/studio";

const nuxtPathsShimCode = `function joinURL(base, ...parts) {
  let out = typeof base === 'string' && base.length > 0 ? base : '/'
  for (const part of parts) {
    if (part == null || part === '') continue
    out = out.replace(/\\/+$/, '') + '/' + String(part).replace(/^\\/+/, '')
  }
  return out === '' ? '/' : out
}
export function baseURL() {
  return process.env.NUXT_APP_BASE_URL || process.env.NITRO_APP_BASE_URL || '/'
}
export function buildAssetsDir() {
  return process.env.NUXT_APP_BUILD_ASSETS_DIR || '/_nuxt/'
}
export function publicAssetsURL(...path) {
  const publicBase = process.env.NUXT_APP_CDN_URL || baseURL()
  return path.length > 0 ? joinURL(publicBase, ...path) : publicBase
}
export function buildAssetsURL(...path) {
  return joinURL(publicAssetsURL(), buildAssetsDir(), ...path)
}
`;

function stripOrderPrefix(segment: string) {
  return segment.replace(/^\d+\./, "");
}

function collectMarkdownFiles(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }

  return readdirSync(dir).flatMap((entry) => {
    const entryPath = join(dir, entry);
    const entryStats = statSync(entryPath);

    if (entryStats.isDirectory()) {
      return collectMarkdownFiles(entryPath);
    }

    return extname(entryPath) === ".md" ? [entryPath] : [];
  });
}

function toContentPath(contentDir: string, filePath: string) {
  const relativePath = filePath
    .slice(contentDir.length + 1)
    .replace(/\\/g, "/")
    .replace(/\.md$/, "");

  const segments = relativePath.split("/").map(stripOrderPrefix);
  const pageName = segments.at(-1);

  if (!pageName || segments.some((segment) => segment.startsWith("_") || segment.startsWith("."))) {
    return null;
  }

  if (pageName === "index") {
    segments.pop();
  }

  return `/${segments.filter(Boolean).join("/")}`;
}

const contentDir = resolve(process.cwd(), "content");
const contentPagePaths = collectMarkdownFiles(contentDir)
  .map((filePath) => toContentPath(contentDir, filePath))
  .filter((path): path is string => Boolean(path));

async function ensureNuxtInternalPathsShim(rootDir: string) {
  const runtimePackageDirs = [
    // Dev runtime packages
    resolve(rootDir, ".nuxt/dist/server/node_modules/nuxt"),
    resolve(rootDir, ".nuxt/dist/server/node_modules/nuxt-site-config"),
    resolve(rootDir, ".nuxt/dist/server/node_modules/_nuxt/content"),
    resolve(rootDir, ".nuxt/dist/server/node_modules/_nuxtjs/mdc"),
    // Build/preview runtime packages
    resolve(rootDir, ".output/server/node_modules/nuxt"),
    resolve(rootDir, ".output/server/node_modules/nuxt-site-config"),
    resolve(rootDir, ".output/server/node_modules/_nuxt/content"),
    resolve(rootDir, ".output/server/node_modules/_nuxtjs/mdc"),
  ];

  for (const nuxtRuntimePackageDir of runtimePackageDirs) {
    try {
      await access(nuxtRuntimePackageDir);
    } catch {
      continue;
    }

    const shimDir = resolve(nuxtRuntimePackageDir, "dist/internal");
    await mkdir(shimDir, { recursive: true });

    await writeFile(
      resolve(shimDir, "paths-shim.mjs"),
      nuxtPathsShimCode,
      "utf8",
    );

    await writeFile(
      resolve(nuxtRuntimePackageDir, "package.json"),
      `${JSON.stringify(
        {
          name: `${basename(nuxtRuntimePackageDir)}-ssr-shim`,
          type: "module",
          imports: {
            "#internal/nuxt/paths": "./dist/internal/paths-shim.mjs",
          },
        },
        null,
        2,
      )}\n`,
      "utf8",
    );
  }
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  extends: ["shadcn-docs-nuxt"],
  compatibilityDate: "2024-09-19",

  runtimeConfig: {
    docsPagePaths: contentPagePaths,
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || defaultSiteUrl,
    },
  },

  appConfig: { contentPagePaths },

  content: {
    watch: false,
  },

  components: {
    dirs: [
      {
        path: "./node_modules/shadcn-docs-nuxt/components",
        ignore: ["ui/**", "**/*.ts"],
        priority: -1,
      },
      {
        path: "~/components",
        priority: 1,
      },
      {
        path: "~/components/content",
        prefix: "",
      },
    ],
  },

  routeRules: {
    "/": { redirect: { to: latestDocsHome, statusCode: 302 } },
    ...Object.fromEntries(docsVersions.map(({ id }) => [
      `/${id}`,
      { redirect: { to: getDocsHome(id), statusCode: 302 } },
    ])),
  },

  nitro: {
    preset: "cloudflare_pages",
    cloudflare: {
      pages: {
        // Serve known pages/assets statically; send unmatched URLs to the redirect middleware.
        routes: { include: ["/*"] },
      },
    },
    // Publish guides as HTML so direct visits do not depend on runtime rendering.
    prerender: {
      routes: contentPagePaths,
      crawlLinks: false,
      autoSubfolderIndex: false,
      failOnError: true,
    },
  },

  hooks: {
    async "build:done"() {
      await ensureNuxtInternalPathsShim(process.cwd());
    },
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
