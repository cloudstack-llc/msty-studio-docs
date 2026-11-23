const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { afterEach, beforeEach, test } = require("node:test");

const scriptPath = path.join(__dirname, "build-studio-docs.cjs");
let fixtureDir;

function addPage(file, title, body) {
  const filePath = path.join(fixtureDir, "content", file);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `---\ntitle: ${title}\ndescription: Guide to ${title}\n---\n\n${body}\n`);
}

function buildArtifacts(script = scriptPath) {
  const result = spawnSync(process.execPath, [script], {
    cwd: fixtureDir,
    encoding: "utf8",
    env: { ...process.env, NUXT_PUBLIC_SITE_URL: "https://docs.example/studio/" },
  });
  assert.equal(result.status, 0, result.stderr);
  return Object.fromEntries(["studio-docs.txt", "studio-docs-v2.txt", "llms.txt", "sitemap.xml"]
    .map((file) => [file, fs.readFileSync(path.join(fixtureDir, "public", file), "utf8")]));
}

beforeEach(() => {
  fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), "studio-docs-artifacts-"));
  addPage("v2/2.models/0.index.md", "Legacy models", "LEGACY_MODELS_BODY");
  addPage("v2/2.models/10.late.md", "Legacy late", "LEGACY_LATE_BODY");
  addPage("v2/2.models/2.early.md", "Legacy early", "LEGACY_EARLY_BODY");
  addPage("v3/1.getting-started/0.index.md", "Current start", "CURRENT_START_BODY");
  addPage("v3/1.getting-started/1.quick-start.md", "Current quick start", "CURRENT_QUICK_BODY");
  addPage("v3/2.models/0.index.md", "Current models", "CURRENT_MODELS_BODY");
  addPage("v3/1.getting-started/_draft.md", "Hidden current", "HIDDEN_CURRENT_BODY");
  addPage("v3/_partials/note.md", "Hidden directory", "HIDDEN_DIRECTORY_BODY");
  addPage("v2/2.models/0._draft.md", "Hidden legacy", "HIDDEN_LEGACY_BODY");
});

afterEach(() => {
  fs.rmSync(fixtureDir, { recursive: true, force: true });
});

test("keeps the default 3.x and archived 2.x exports separate", () => {
  const artifacts = buildArtifacts();
  const current = artifacts["studio-docs.txt"];
  const legacy = artifacts["studio-docs-v2.txt"];

  assert.match(current, /^# Msty Studio 3\.x documentation\n/);
  assert.match(current, /3\.x Desktop\. Studio Web remains on 2\.x/);
  assert.match(current, /CURRENT_START_BODY/);
  assert.match(current, /CURRENT_QUICK_BODY/);
  assert.match(current, /CURRENT_MODELS_BODY/);
  assert.doesNotMatch(current, /LEGACY_.*_BODY/);
  assert.match(legacy, /^# Msty Studio 2\.x documentation\n/);
  assert.match(legacy, /LEGACY_MODELS_BODY/);
  assert.match(legacy, /LEGACY_EARLY_BODY/);
  assert.match(legacy, /LEGACY_LATE_BODY/);
  assert.doesNotMatch(legacy, /CURRENT_.*_BODY/);

  for (const value of Object.values(artifacts)) {
    assert.doesNotMatch(value, /HIDDEN_|Hidden current|Hidden legacy|Hidden directory|_draft|_partials/);
  }
  assert.doesNotMatch(current, /description: Guide/);
  assert.doesNotMatch(legacy, /description: Guide/);
});

test("lists 3.x first with explicit scopes and separate export links", () => {
  const { "llms.txt": index } = buildArtifacts();
  const currentHeading = index.indexOf("## 3.x Desktop docs (default)");
  const legacyHeading = index.indexOf("## 2.x docs");
  assert.ok(currentHeading > 0 && currentHeading < legacyHeading);
  assert.match(index, /Studio Web remains on 2\.x/);

  const currentSection = index.slice(currentHeading, legacyHeading);
  const legacySection = index.slice(legacyHeading);
  assert.match(currentSection, /\[Current start\]\(https:\/\/docs\.example\/studio\/v3\/getting-started\)/);
  assert.match(currentSection, /\[3\.x documentation text\]\(https:\/\/docs\.example\/studio\/studio-docs\.txt\)/);
  assert.doesNotMatch(currentSection, /\[Legacy /);
  assert.match(legacySection, /\[Legacy models\]\(https:\/\/docs\.example\/studio\/v2\/models\)/);
  assert.match(legacySection, /\[2\.x documentation text\]\(https:\/\/docs\.example\/studio\/studio-docs-v2\.txt\)/);
  assert.doesNotMatch(legacySection, /\[Current /);
});

test("includes exact routes for both versions in numeric content order", () => {
  const { "sitemap.xml": sitemap } = buildArtifacts();
  const routes = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  assert.deepEqual(routes, [
    "https://docs.example/studio/v3/getting-started",
    "https://docs.example/studio/v3/getting-started/quick-start",
    "https://docs.example/studio/v3/models",
    "https://docs.example/studio/v2/models",
    "https://docs.example/studio/v2/models/early",
    "https://docs.example/studio/v2/models/late",
  ]);
});

test("adding a version and changing latest updates exports and indexes without code changes", () => {
  const configuration = require("../docs-versions.json");
  const nextVersion = { id: "v4", label: "4.x", scope: "Desktop", description: "Fourth version guides." };
  const scriptsDir = path.join(fixtureDir, "scripts");
  fs.mkdirSync(scriptsDir);
  const fixtureScript = path.join(scriptsDir, "build-studio-docs.cjs");
  fs.copyFileSync(scriptPath, fixtureScript);
  fs.writeFileSync(path.join(fixtureDir, "docs-versions.json"), JSON.stringify({
    latest: "v4", versions: [...configuration.versions, nextVersion],
  }));
  addPage("v4/1.getting-started/0.index.md", "Next start", "NEXT_VERSION_BODY");
  const artifacts = buildArtifacts(fixtureScript);
  assert.match(artifacts["studio-docs.txt"], /^# Msty Studio 4\.x documentation/);
  assert.match(artifacts["studio-docs.txt"], /NEXT_VERSION_BODY/);
  assert.doesNotMatch(artifacts["studio-docs.txt"], /CURRENT_.*_BODY|LEGACY_.*_BODY/);
  const thirdVersion = fs.readFileSync(path.join(fixtureDir, "public/studio-docs-v3.txt"), "utf8");
  assert.match(thirdVersion, /CURRENT_START_BODY/);
  assert.doesNotMatch(thirdVersion, /NEXT_VERSION_BODY/);
  assert.ok(artifacts["llms.txt"].indexOf("## 4.x Desktop docs (default)") < artifacts["llms.txt"].indexOf("## 3.x Desktop docs"));
  assert.match(artifacts["sitemap.xml"], /<loc>https:\/\/docs\.example\/studio\/v4\/getting-started<\/loc>/);
});
