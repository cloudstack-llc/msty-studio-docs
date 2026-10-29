export function useDocsVersion() {
  const route = useRoute();
  const { navigation } = useContent();
  const isV3 = computed(() => route.path === '/v3' || route.path.startsWith('/v3/'));
  const version = computed(() => isV3.value ? '3.x' : '2.x');
  const home = computed(() => isV3.value ? '/v3/getting-started' : '/getting-started');
  const belongsToVersion = (path: string) => (path === '/v3' || path.startsWith('/v3/')) === isV3.value;
  const versionNavigation = computed(() => {
    const links = navigation.value ?? [];
    return isV3.value
      ? links.find(link => link._path === '/v3')?.children ?? []
      : links.filter(link => link._path !== '/v3');
  });

  return { isV3, version, home, belongsToVersion, versionNavigation };
}
