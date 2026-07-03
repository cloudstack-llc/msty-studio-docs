import { existsSync, readdirSync, statSync } from "node:fs";
import { access, mkdir, writeFile } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";

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

function permanentRedirect(to: string) {
  return {
    redirect: {
      to,
      statusCode: 301,
    },
  };
}

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

  if (!pageName || pageName.startsWith("_")) {
    return null;
  }

  if (pageName === "index") {
    segments.pop();
  }

  return `/${segments.filter(Boolean).join("/")}`;
}

function createLegacyFeatureRedirects(rootDir: string) {
  const contentDir = resolve(rootDir, "content");
  const contentPaths = collectMarkdownFiles(contentDir)
    .map((filePath) => toContentPath(contentDir, filePath))
    .filter((path): path is string => Boolean(path));

  return Object.fromEntries([
    ...contentPaths.map((path) => [`/features${path}`, permanentRedirect(path)]),
    ...contentPaths
      .filter((path) => path.startsWith("/managing-models/"))
      .map((path) => [
        `/features/${path.slice("/managing-models/".length)}`,
        permanentRedirect(path),
      ]),
  ]);
}

function createRedirects(redirects: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(redirects).map(([from, to]) => [from, permanentRedirect(to)]),
  );
}

const reportedLegacyRedirects = createRedirects({
  "/features/advanced-configs": "/managing-models/advanced-configs",
  "/features/conversations/main-chat": "/conversations/main-chat",
  "/features/conversations/split-chat": "/conversations/split-chat",
  "/features/conversations/system-prompts": "/conversations/system-prompts",
  "/features/forge-mode": "/conversations/forge-mode",
  "/features/image-gen": "/managing-models/image-gen",
  "/features/knowledge-stacks/overview": "/knowledge-stacks/overview",
  "/features/real-time-data": "/add-ons/real-time-data",
  "/features/remote-connections": "/settings/remote-connections",
  "/features/settings": "/settings",
  "/features/thinking-effort": "/managing-models/thinking-effort",
  "/features/toolbox/live-contexts": "/toolbox/live-contexts",
  "/features/toolbox/tool-dependencies": "/toolbox/tool-dependencies",
  "/features/toolbox/tools": "/toolbox/tools",
  "/features/toolbox/toolsets": "/toolbox/toolsets",
  "/features/turnstiles": "/add-ons/turnstiles",
  "/getting-started/desktop": "/getting-started/download",
  "/getting-started/llama.cpp-models": "/managing-models/local-models",
  "/getting-started/managing-models": "/managing-models",
  "/getting-started/mlx-models": "/managing-models/local-models",
  "/getting-started/onboarding": "/getting-started/quick-start",
  "/getting-started/sidecar": "/how-tos/sidecar",
  "/how-tos/get-latest-ollama": "/managing-models/local-models",
  "/msty-claw/configurations": "https://docs.msty.ai/claw/general-settings",
  "/msty-claw/setup": "https://docs.msty.ai/claw/setup",
});

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
  devtools: { enabled: true },
  extends: ["shadcn-docs-nuxt"],
  compatibilityDate: "2024-09-19",

  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || defaultSiteUrl,
    },
  },

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
    ...createLegacyFeatureRedirects(process.cwd()),
    ...reportedLegacyRedirects,
  },

  nitro: {
    preset: "cloudflare_pages",
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
