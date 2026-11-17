For more details regarding the setup see: [shadcn-docs-nuxt](https://github.com/ZTL-UwU/shadcn-docs-nuxt).

## Documentation versions

All guides use explicit version URLs: `/v3/...`, `/v2/...`, etc. The version selector, landing page redirects, and documentation exports read `docs-versions.json`. Its `latest` field identifies the default version.

The content directory follows the same structure: `content/v3/`, `content/v2/`, etc. Internal guide links include the version prefix; shared assets remain under `/images/`.

The root, unversioned URLs, and unknown documentation URLs redirect temporarily to the latest version's getting-started page. Version roots such as `/v2` open that version's getting-started page. Missing assets and API endpoints do not redirect. Server and client navigation use the same fallback rules; no individual legacy URL mappings are maintained.

To add a release, add its content directory and entry in `docs-versions.json`, then update `latest`. Existing version URLs continue to serve their own guides. Verify with `node --test scripts/*.test.cjs` and `bun run build`.

## Setup

Make sure to install the dependencies:

```bash

# bun
bun install
```

## Development Server

Start the development server on http://localhost:3000

```bash
bun run dev
```

## Production

Build the application for production:

```bash
bun run build
```

Locally preview production build:

```bash
bun run preview
```

## Generate Docs Artifacts

To generate docs artifacts, run:

```bash
bun run docs:artifacts
```

This creates or updates:

- `public/studio-docs.txt` with the latest version's markdown content and YAML frontmatter removed.
- `public/studio-docs-v*.txt` with a separate export for each configured version.
- `public/sitemap.xml` with canonical `https://docs.msty.ai/studio` docs routes.
- `public/llms.txt` with an LLM-friendly index of canonical docs pages.
