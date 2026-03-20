import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

type BuildManifestEntry = {
  file?: string;
  isEntry?: boolean;
  sideEffects?: boolean;
  css?: string[];
  assets?: string[];
  imports?: string[];
  preload?: boolean;
  resourceType?: string;
  mimeType?: string;
  module?: boolean;
};

type BuildManifest = Record<string, BuildManifestEntry>;

const watchIgnoredGlobs = [
  "**/.git/**",
  "**/node_modules/**",
  "**/.nuxt/**",
  "**/.output/**",
  "**/.pnpm-store/**",
  "**/dist/**",
  "**/.data/**",
  "**/.idea/**",
  "**/.fleet/**",
];

function precomputeDependencies(manifest: BuildManifest) {
  const dependencies: Record<string, {
    scripts: Record<string, BuildManifestEntry>;
    styles: Record<string, BuildManifestEntry>;
    preload: Record<string, BuildManifestEntry>;
    prefetch: Record<string, BuildManifestEntry>;
  }> = {};
  const computing = new Set<string>();

  function computeDependencies(id: string) {
    if (dependencies[id]) {
      return dependencies[id];
    }

    if (computing.has(id)) {
      return { scripts: {}, styles: {}, preload: {}, prefetch: {} };
    }

    computing.add(id);

    const deps = {
      scripts: {} as Record<string, BuildManifestEntry>,
      styles: {} as Record<string, BuildManifestEntry>,
      preload: {} as Record<string, BuildManifestEntry>,
      prefetch: {} as Record<string, BuildManifestEntry>,
    };

    const meta = manifest[id];
    if (!meta) {
      dependencies[id] = deps;
      computing.delete(id);
      return deps;
    }

    if (meta.file) {
      deps.preload[id] = meta;
      if (meta.isEntry || meta.sideEffects) {
        deps.scripts[id] = meta;
      }
    }

    for (const css of meta.css || []) {
      const cssResource = manifest[css];
      if (cssResource) {
        deps.styles[css] = cssResource;
        deps.preload[css] = cssResource;
        deps.prefetch[css] = cssResource;
      }
    }

    for (const asset of meta.assets || []) {
      const assetResource = manifest[asset];
      if (assetResource) {
        deps.preload[asset] = assetResource;
        deps.prefetch[asset] = assetResource;
      }
    }

    for (const depId of meta.imports || []) {
      const depDeps = computeDependencies(depId);
      Object.assign(deps.styles, depDeps.styles);
      Object.assign(deps.preload, depDeps.preload);
      Object.assign(deps.prefetch, depDeps.prefetch);
    }

    const filteredPreload: Record<string, BuildManifestEntry> = {};
    for (const depId in deps.preload) {
      const dep = deps.preload[depId];
      if (dep.preload) {
        filteredPreload[depId] = dep;
      }
    }
    deps.preload = filteredPreload;

    dependencies[id] = deps;
    computing.delete(id);
    return deps;
  }

  for (const moduleId of Object.keys(manifest)) {
    computeDependencies(moduleId);
  }

  const entrypoints = new Set<string>();
  for (const key in manifest) {
    const meta = manifest[key];
    if (meta?.isEntry) {
      entrypoints.add(key);
    }
  }

  const modules: Record<string, {
    file?: string;
    resourceType?: string;
    mimeType?: string;
    module?: boolean;
  }> = {};
  for (const [moduleId, meta] of Object.entries(manifest)) {
    modules[moduleId] = {
      file: meta.file,
      resourceType: meta.resourceType,
      mimeType: meta.mimeType,
      module: meta.module,
    };
  }

  return {
    dependencies,
    entrypoints: [...entrypoints],
    modules,
  };
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

  ogImage: {
    enabled: false,
  },

  hooks: {
    /**
     * Compatibility fallback for environments where Nuxt/Nitro expects
     * `.nuxt/dist/server/client.precomputed.mjs` but the active builder path
     * does not emit it.
     */
    async "build:manifest"(manifest: BuildManifest) {
      const buildDir = resolve(process.cwd(), ".nuxt");
      const serverDist = resolve(buildDir, "dist/server");
      const precomputed = precomputeDependencies(manifest);
      await mkdir(serverDist, { recursive: true });
      await writeFile(
        resolve(serverDist, "client.precomputed.mjs"),
        `export default ${JSON.stringify(precomputed)}`,
        "utf8",
      );
    },
  },
});
