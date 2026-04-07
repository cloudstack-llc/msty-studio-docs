import { access, mkdir, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

const watchIgnored = [
  "**/.git/**",
  "**/.nuxt/**",
  "**/.output/**",
  "**/.data/**",
  "**/dist/**",
  "**/node_modules/**",
  "**/.pnpm-store/**",
];

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
