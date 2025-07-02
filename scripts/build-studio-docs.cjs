const fs = require("fs");
const path = require("path");

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
const files = getAllMarkdownFiles(contentDir);
const allContent = files
  .map((file) => {
    const raw = fs.readFileSync(file, "utf-8");
    return stripYamlFrontmatter(raw);
  })
  .join("\n\n---\n\n");

const outputPath = path.join(process.cwd(), "public", "studio-docs.txt");
fs.writeFileSync(outputPath, allContent, "utf-8");
console.log("studio-docs.txt generated at public/studio-docs.txt!");
