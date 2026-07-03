const fs = require("fs");
const path = require("path");

const defaultSiteUrl = "https://docs.msty.ai/studio";
const siteUrl = (process.env.NUXT_PUBLIC_SITE_URL || defaultSiteUrl).replace(
  /\/$/,
  "",
);

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

function getRouteFromFile(file, contentDir) {
  const routePath = path
    .relative(contentDir, file)
    .replace(/\.md$/, "")
    .split(path.sep)
    .map(stripOrderPrefix)
    .filter((segment) => segment !== "index" && !segment.startsWith("_"))
    .join("/");

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
const routes = [...files]
  .sort((a, b) => compareFilesByRouteOrder(a, b, contentDir))
  .map((file) => getRouteFromFile(file, contentDir));
const allContent = files
  .map((file) => {
    const raw = fs.readFileSync(file, "utf-8");
    return stripYamlFrontmatter(raw);
  })
  .join("\n\n---\n\n");

writeFileIfChanged(path.join(publicDir, "studio-docs.txt"), allContent);
writeFileIfChanged(path.join(publicDir, "sitemap.xml"), buildSitemap(routes));

console.log("Generated public/studio-docs.txt");
console.log("Generated public/sitemap.xml");
