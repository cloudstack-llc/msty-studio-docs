For more details regarding the setup see: [shadcn-docs-nuxt](https://github.com/ZTL-UwU/shadcn-docs-nuxt).

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

- `public/studio-docs.txt` with all markdown content and YAML frontmatter removed.
- `public/sitemap.xml` with canonical `https://docs.msty.ai/studio` docs routes.
- `public/llms.txt` with an LLM-friendly index of canonical docs pages.
