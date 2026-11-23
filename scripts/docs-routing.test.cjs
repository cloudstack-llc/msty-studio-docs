const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createJiti } = require("jiti");
const h3 = require("h3");

const jiti = createJiti(__filename);
global.defineNuxtConfig = (config) => config;
const config = jiti("../nuxt.config.ts").default;
const { docsVersions, getDocsHome, getDocsRedirect, latestDocsHome } = jiti("../utils/docsVersions.ts");
const pages = config.appConfig.contentPagePaths;

test("all guides and version roots use configured version prefixes", () => {
  for (const path of pages) {
    assert.ok(docsVersions.some(({ id }) => path.startsWith(`/${id}/`)), path);
    assert.equal(getDocsRedirect(path, pages), undefined);
    assert.equal(getDocsRedirect(`${path}/`, pages), undefined);
  }
  for (const { id } of docsVersions) {
    assert.ok(pages.includes(getDocsHome(id)));
    assert.equal(getDocsRedirect(`/${id}`, pages), getDocsHome(id));
    assert.equal(config.routeRules[`/${id}`].redirect.to, getDocsHome(id));
  }
  assert.equal(config.routeRules["/"].redirect.to, latestDocsHome);
  assert.equal(config.routeRules["/"].redirect.statusCode, 302);
});

test("unknown and unversioned docs URLs fall back to the latest landing page", () => {
  for (const path of ["/", "/docs", "/getting-started", "/features/advanced-configs", "/anything/nested", "/v2/missing", "/v3/missing", "/v999/getting-started", "/vLatest/getting-started"]) {
    assert.equal(getDocsRedirect(path, pages), latestDocsHome, path);
  }
});

test("assets, framework routes, and APIs never redirect to a docs page", () => {
  for (const path of ["/api", "/api/not-found", "/_nuxt/missing.js", "/_ipx/image", "/__nuxt_error", "/images/missing", "/videos/missing", "/fonts/missing", "/missing.png", "/missing.js", "/missing.css", "/missing.json", "/studio-docs.txt", "/sitemap.xml"]) {
    assert.equal(getDocsRedirect(path, pages), undefined, path);
  }
});

test("Cloudflare sends unmatched routes to the worker", () => {
  assert.deepEqual(config.nitro.cloudflare.pages.routes.include, ["/*"]);
  assert.notEqual(config.nitro.cloudflare.pages.defaultRoutes, false);
});

// Exercise the actual server middleware with H3's request/response handling.
global.defineEventHandler = h3.defineEventHandler;
global.getRequestURL = h3.getRequestURL;
global.sendRedirect = h3.sendRedirect;
global.useRuntimeConfig = () => config.runtimeConfig;
const middleware = jiti("../server/middleware/docs-redirect.ts").default;
const app = h3.createApp();
app.use(middleware);
app.use(h3.defineEventHandler((event) => {
  if (pages.includes(h3.getRequestURL(event).pathname)) return "guide";
  throw h3.createError({ statusCode: 404 });
}));
const request = h3.toWebHandler(app);

test("server redirects missing docs with 302 while preserving real guides and errors", async () => {
  for (const method of ["GET", "HEAD"]) {
    for (const path of ["/getting-started", "/v3/not-found", "/v2/not-found"]) {
      const response = await request(new Request(`https://docs.example${path}`, { method }));
      assert.equal(response.status, 302, path);
      assert.equal(response.headers.get("location"), latestDocsHome, path);
    }
  }
  for (const path of ["/v3/getting-started", "/v2/getting-started"]) {
    assert.equal((await request(new Request(`https://docs.example${path}`))).status, 200, path);
  }
  for (const path of ["/api/not-found", "/images/not-found.png", "/missing.js"]) {
    const response = await request(new Request(`https://docs.example${path}`));
    assert.equal(response.status, 404, path);
    assert.equal(response.headers.get("location"), null, path);
  }
});

test("Cloudflare serves known guides from built assets while missing docs still redirect", async () => {
  const assetRequests = [];
  const assetsApp = h3.createApp();
  assetsApp.use(h3.defineEventHandler((event) => {
    event.context.cloudflare = {
      request: new Request(`https://docs.example${event.path}`),
      env: { ASSETS: { fetch(request) {
        assetRequests.push(new URL(request.url).pathname);
        return new Response("built asset", { status: request.url.endsWith(".png") ? 404 : 200 });
      } } },
    };
  }));
  assetsApp.use(middleware);
  const fetchAsset = h3.toWebHandler(assetsApp);
  const guide = await fetchAsset(new Request("https://docs.example/v2/settings/remote-connections"));
  assert.equal(guide.status, 200);
  assert.equal(await guide.text(), "built asset");
  const missing = await fetchAsset(new Request("https://docs.example/v2/not-found"));
  assert.equal(missing.status, 302);
  const image = await fetchAsset(new Request("https://docs.example/images/not-found.png"));
  assert.equal(image.status, 404);
  assert.deepEqual(assetRequests, ["/v2/settings/remote-connections", "/images/not-found.png"]);
});
