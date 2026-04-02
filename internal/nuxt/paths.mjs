function joinURL(base, ...parts) {
  let out = typeof base === 'string' && base.length > 0 ? base : '/'
  for (const part of parts) {
    if (part == null || part === '') {
      continue
    }
    out = out.replace(/\/+$/, '') + '/' + String(part).replace(/^\/+/, '')
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
