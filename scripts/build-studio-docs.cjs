const fs = require("fs");
const path = require("path");

const defaultSiteUrl = "https://docs.msty.ai/studio";
const siteUrl = (process.env.NUXT_PUBLIC_SITE_URL || defaultSiteUrl).replace(
  /\/+$/,
  "",
);
const siteName = "Msty Studio Docs";
const siteDescription =
  "Guides for Msty Studio 3.x Desktop, with the preserved 2.x documentation available separately.";

function getAllMarkdownFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllMarkdownFiles(filePath));
    } else if (path.extname(file) === ".md") {
      results.push(filePath);
    }
  });
  return results;
}

function stripOrderPrefix(segment) {
  return segment.replace(/^\d+\./, "");
}

function parseFrontmatter(content) {
  if (!content.startsWith("---")) {
    return {};
  }

  const end = content.indexOf("---", 3);
  if (end === -1) {
    return {};
  }

  const yaml = content.slice(3, end);
  const data = {};
  yaml.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) {
      return;
    }

    const [, key, rawValue] = match;
    data[key] = rawValue.replace(/^["']|["']$/g, "");
  });

  return data;
}

function getRouteFromFile(file, contentDir) {
  const segments = path
    .relative(contentDir, file)
    .replace(/\.md$/, "")
    .split(path.sep)
    .map(stripOrderPrefix);

  if (segments.some((segment) => segment.startsWith("_") || segment.startsWith("."))) {
    return null;
  }

  if (segments.at(-1) === "index") {
    segments.pop();
  }

  const routePath = segments.join("/");

  return `/${routePath}`.replace(/\/$/, "") || "/";
}

function getSortParts(file, contentDir) {
  return path
    .relative(contentDir, file)
    .replace(/\.md$/, "")
    .split(path.sep)
    .map((segment) => {
      const match = segment.match(/^(\d+)\.(.+)$/);
      return {
        order: match ? Number(match[1]) : Number.MAX_SAFE_INTEGER,
        slug: match ? match[2] : segment,
      };
    });
}

function compareFilesByRouteOrder(a, b, contentDir) {
  const aParts = getSortParts(a, contentDir);
  const bParts = getSortParts(b, contentDir);
  const length = Math.max(aParts.length, bParts.length);

  for (let index = 0; index < length; index += 1) {
    const aPart = aParts[index] || {
      order: Number.MAX_SAFE_INTEGER,
      slug: "",
    };
    const bPart = bParts[index] || {
      order: Number.MAX_SAFE_INTEGER,
      slug: "",
    };

    if (aPart.order !== bPart.order) {
      return aPart.order - bPart.order;
    }

    const slugCompare = aPart.slug.localeCompare(bPart.slug);
    if (slugCompare !== 0) {
      return slugCompare;
    }
  }

  return 0;
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSitemap(routes) {
  const urls = routes
    .map(
      (route) =>
        `  <url>\n    <loc>${escapeXml(`${siteUrl}${route}`)}</loc>\n  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function formatAbsoluteUrl(route) {
  return `${siteUrl}${route}`;
}

function formatPageList(pages) {
  return pages
    .map((page) => {
      const description = page.description ? `: ${page.description}` : "";
      return `- [${page.title}](${formatAbsoluteUrl(page.route)})${description}`;
    })
    .join("\n");
}

function buildLlmsTxt(currentPages, legacyPages) {

  return `# ${siteName}

> ${siteDescription}

The default documentation covers Msty Studio 3.x Desktop. Msty Studio Web remains on 2.x; use the 2.x guides for that version. Do not apply 3.x interface instructions to 2.x.

## 3.x Desktop docs (default)

${formatPageList(currentPages)}

- [3.x documentation text](${formatAbsoluteUrl("/studio-docs.txt")}): Combined export of only the 3.x guides.

## 2.x docs

${formatPageList(legacyPages)}

- [2.x documentation text](${formatAbsoluteUrl("/studio-docs-v2.txt")}): Separate export of the preserved 2.x guides.

## Additional Resources

- [Msty Studio product page](https://msty.ai): Download and product information.
`;
}

function buildDocumentationText(pages, version) {
  const scope = version === "3.x"
    ? "These guides cover Msty Studio 3.x Desktop. Studio Web remains on 2.x."
    : "These guides preserve the Msty Studio 2.x documentation.";
  const content = pages.map((page) =>
    `## ${page.title}\n\nSource: ${formatAbsoluteUrl(page.route)}\n\n${stripYamlFrontmatter(page.raw).trim()}`,
  ).join("\n\n---\n\n");

  return `# Msty Studio ${version} documentation\n\n${scope}\n\n${content}\n`;
}

function writeFileIfChanged(filePath, content) {
  if (fs.existsSync(filePath) && fs.readFileSync(filePath, "utf-8") === content) {
    return false;
  }

  fs.writeFileSync(filePath, content, "utf-8");
  return true;
}

function stripYamlFrontmatter(content) {
  // Remove YAML frontmatter if present (--- at start)
  if (content.startsWith("---")) {
    const end = content.indexOf("---", 3);
    if (end !== -1) {
      return content.slice(end + 3).trimStart();
    }
  }
  return content;
}

const contentDir = path.join(process.cwd(), "content");
const publicDir = path.join(process.cwd(), "public");
const files = getAllMarkdownFiles(contentDir);
const pages = [...files].sort((a, b) =>
  compareFilesByRouteOrder(a, b, contentDir),
).map((file) => {
  const raw = fs.readFileSync(file, "utf-8");
  const frontmatter = parseFrontmatter(raw);
  const route = getRouteFromFile(file, contentDir);
  if (!route) {
    return null;
  }

  return {
    route,
    title: frontmatter.title || route.replace(/^\//, ""),
    description: frontmatter.description || "",
    raw,
    version: route === "/v3" || route.startsWith("/v3/") ? "3.x" : "2.x",
  };
}).filter(Boolean);
const currentPages = pages.filter((page) => page.version === "3.x");
const legacyPages = pages.filter((page) => page.version === "2.x");
const routes = [...currentPages, ...legacyPages].map((page) => page.route);

fs.mkdirSync(publicDir, { recursive: true });
writeFileIfChanged(path.join(publicDir, "studio-docs.txt"), buildDocumentationText(currentPages, "3.x"));
writeFileIfChanged(path.join(publicDir, "studio-docs-v2.txt"), buildDocumentationText(legacyPages, "2.x"));
writeFileIfChanged(path.join(publicDir, "sitemap.xml"), buildSitemap(routes));
writeFileIfChanged(path.join(publicDir, "llms.txt"), buildLlmsTxt(currentPages, legacyPages));

console.log("Generated public/studio-docs.txt");
console.log("Generated public/studio-docs-v2.txt");
console.log("Generated public/sitemap.xml");
console.log("Generated public/llms.txt");
