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

## Export All Markdown Content

To generate a single text file containing all markdown content (with YAML frontmatter removed), run:

```bash
node scripts/build-studio-docs.cjs
```

This will create (or update) `public/studio-docs.txt` with the combined contents of all markdown files in the `content` directory.
