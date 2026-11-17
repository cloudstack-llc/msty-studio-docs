import { getDocsRedirect, isNonDocsPath } from '../../utils/docsVersions';

export default defineEventHandler((event) => {
  if (event.method !== 'GET' && event.method !== 'HEAD') return;
  const config = useRuntimeConfig(event);
  const path = getRequestURL(event).pathname;
  const target = getDocsRedirect(path, config.docsPagePaths);
  if (target) return sendRedirect(event, target, 302);

  // Cloudflare caps static route exclusions; serve remaining guides from built HTML too.
  const cloudflare = event.context.cloudflare;
  const isStaticResource = isNonDocsPath(path) && !/^\/(?:api(?:\/|$)|_)/.test(path);
  if (cloudflare?.env?.ASSETS && (config.docsPagePaths.includes(path.replace(/\/+$/, '')) || isStaticResource)) {
    return cloudflare.env.ASSETS.fetch(cloudflare.request);
  }
});
