import { docsVersions, getDocsHome, getDocsVersion, latestDocsHome, latestDocsVersion } from '../utils/docsVersions';

export function useDocsVersion() {
  const route = useRoute();
  const { navigation } = useContent();
  const selectedVersion = computed(() => getDocsVersion(route.path));
  const isLatest = computed(() => selectedVersion.value.id === latestDocsVersion.id);
  const version = computed(() => selectedVersion.value.label);
  const home = computed(() => getDocsHome(selectedVersion.value.id));
  const belongsToVersion = (path: string) => path === `/${selectedVersion.value.id}` || path.startsWith(`/${selectedVersion.value.id}/`);
  const versionNavigation = computed(() => {
    const links = navigation.value ?? [];
    return links.find(link => link._path === `/${selectedVersion.value.id}`)?.children ?? [];
  });

  return { selectedVersion, isLatest, version, home, belongsToVersion, versionNavigation, docsVersions, latestDocsVersion, latestDocsHome };
}
