import { getDocsRedirect } from '../utils/docsVersions';

export default defineNuxtRouteMiddleware((to) => {
  const target = getDocsRedirect(to.path, useAppConfig().contentPagePaths);
  if (target) return navigateTo(target, { redirectCode: 302, replace: true });
});
