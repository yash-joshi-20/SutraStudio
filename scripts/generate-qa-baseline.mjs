import fs from "fs";
import path from "path";

const ROOT = process.cwd();

function getFiles(dir, filter) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(full, filter));
    } else if (!filter || filter(full)) {
      results.push(full);
    }
  }
  return results;
}

const pageFiles = getFiles(path.join(ROOT, "src", "app"), f => f.endsWith("page.tsx"));
const pages = pageFiles.map(f => {
  const rel = path.relative(path.join(ROOT, "src", "app"), f).replace(/\\/g, "/");
  if (rel === "page.tsx") return "/";
  return "/" + rel.replace(/\/page\.tsx$/, "");
}).sort();

const apiFiles = getFiles(path.join(ROOT, "src", "app", "api"), f => f.endsWith("route.ts"));
const apis = apiFiles.map(f => {
  const rel = path.relative(path.join(ROOT, "src", "app", "api"), f).replace(/\\/g, "/");
  return "/api/" + rel.replace(/\/route\.ts$/, "");
}).sort();

const compFiles = getFiles(path.join(ROOT, "src", "components"), f => f.endsWith(".tsx") || f.endsWith(".ts"));
const components = compFiles.map(f => path.relative(path.join(ROOT, "src", "components"), f).replace(/\\/g, "/")).sort();

// Find all firestore collections referenced
const allSrcFiles = getFiles(path.join(ROOT, "src"), f => f.endsWith(".ts") || f.endsWith(".tsx"));
const collections = new Set();
const envNames = new Set();

for (const file of allSrcFiles) {
  const content = fs.readFileSync(file, "utf-8");
  
  // collection matching
  const colMatches = content.matchAll(/collection\((?:adminDb\(\)|db|firestore)?,?\s*["']([a-zA-Z0-9_-]+)["']\)/g);
  for (const m of colMatches) {
    collections.add(m[1]);
  }
  const colMatches2 = content.matchAll(/\.collection\(["']([a-zA-Z0-9_-]+)["']\)/g);
  for (const m of colMatches2) {
    collections.add(m[1]);
  }

  // env matching
  const envMatches = content.matchAll(/process\.env\.([A-Z0-9_]+)/g);
  for (const m of envMatches) {
    envNames.add(m[1]);
  }
  const readEnvMatches = content.matchAll(/readEnv\(["']([A-Z0-9_]+)["']\)/g);
  for (const m of readEnvMatches) {
    envNames.add(m[1]);
  }
}

console.log(JSON.stringify({
  pages,
  apis,
  components,
  collections: Array.from(collections).sort(),
  envNames: Array.from(envNames).sort()
}, null, 2));
