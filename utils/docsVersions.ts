import configuration from '../docs-versions.json';

const latestVersion = configuration.versions.find(({ id }) => id === configuration.latest);
if (!latestVersion) throw new Error(`Unknown latest docs version: ${configuration.latest}`);
export const latestDocsVersion = latestVersion;
export const docsVersions = [latestDocsVersion, ...configuration.versions.filter(({ id }) => id !== configuration.latest)];
export const getDocsHome = (id: string) => `/${id}/getting-started`;
export const latestDocsHome = getDocsHome(latestDocsVersion.id);

export function getDocsVersion(path: string) {
  const id = path.split('/')[1];
  return docsVersions.find(version => version.id === id) ?? latestDocsVersion;
}

export function isNonDocsPath(path: string) {
  return path.startsWith('/_')
    || /^\/(?:api|images|videos|fonts)(?:\/|$)/.test(path)
    || /\.(?:avif|css|gif|ico|jpe?g|js|json|map|mjs|mp[34]|pdf|png|svg|txt|wasm|webm|webp|woff2?|ttf|xml|zip)$/i.test(path);
}

export function getDocsRedirect(path: string, pagePaths: readonly string[]) {
  const normalizedPath = path.replace(/\/+$/, '') || '/';
  if (isNonDocsPath(normalizedPath) || pagePaths.includes(normalizedPath)) return;
  const version = docsVersions.find(({ id }) => normalizedPath === `/${id}`);
  return version ? getDocsHome(version.id) : latestDocsHome;
}
