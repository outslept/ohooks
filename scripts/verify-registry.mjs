#!/usr/bin/env node
// The registry IS the product: consumers install hooks with
//   npx shadcn add @ohook/useIdle
// A desynchronised registry breaks other people's projects, not this one.
// Tests cannot see this class of bug. This script can.
//
// Checks 7 invariants:
//   1. every hooks/*.ts has tests/{name}.test.ts
//   2. every hooks/*.ts has content/docs/{kebab}.mdx
//   3. every hooks/*.ts has demos/{name}.tsx
//   4. every hooks/*.ts has a `registry:hook` entry
//   5. every files[].path in registry.json exists on disk
//   6. every registryDependencies resolves to a known item
//   7. no two test files are byte-identical

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const errors = [];
const fail = (msg) => errors.push(msg);

const kebab = (s) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();

const list = (dir, re) =>
  fs.existsSync(path.join(ROOT, dir))
    ? fs.readdirSync(path.join(ROOT, dir)).filter((f) => re.test(f))
    : [];

const hooks = list("hooks", /\.ts$/).map((f) => f.replace(/\.ts$/, ""));
const tests = list("tests", /\.test\.ts$/).map((f) => f.replace(/\.test\.ts$/, ""));
const docs = list("content/docs", /\.mdx$/).map((f) => f.replace(/\.mdx$/, ""));
const demos = list("demos", /\.tsx?$/).map((f) => f.replace(/\.tsx?$/, ""));

if (!hooks.length) {
  console.error("::error::no hooks found — wrong working directory?");
  process.exit(2);
}

let registry;
try {
  registry = JSON.parse(fs.readFileSync(path.join(ROOT, "registry.json"), "utf8"));
} catch (e) {
  console.error(`::error::cannot parse registry.json: ${e.message}`);
  process.exit(2);
}

const items = registry.items ?? registry;
const byName = new Map(items.map((i) => [i.name, i]));
const testSet = new Set(tests);
const docSet = new Set(docs);
const demoSet = new Set(demos);

// 1–4
for (const h of hooks) {
  if (!testSet.has(h)) fail(`no test: tests/${h}.test.ts`);
  if (!docSet.has(kebab(h))) fail(`no doc: content/docs/${kebab(h)}.mdx (for hooks/${h}.ts)`);
  if (!demoSet.has(h)) fail(`no demo: demos/${h}.tsx`);
  if (!byName.has(h)) fail(`no registry entry for hooks/${h}.ts`);
}

// 5
for (const item of items) {
  for (const file of item.files ?? []) {
    if (!fs.existsSync(path.join(ROOT, file.path)))
      fail(`registry item "${item.name}" points at missing file: ${file.path}`);
  }
}

// 6
for (const item of items) {
  for (const dep of item.registryDependencies ?? []) {
    if (!byName.has(dep)) fail(`"${item.name}" depends on unknown registry item "${dep}"`);
  }
}

// 7
const byHash = new Map();
for (const t of testSet) {
  const p = path.join(ROOT, "tests", `${t}.test.ts`);
  const h = crypto.createHash("md5").update(fs.readFileSync(p)).digest("hex");
  if (!byHash.has(h)) byHash.set(h, []);
  byHash.get(h).push(t);
}
for (const group of byHash.values()) {
  if (group.length > 1) fail(`byte-identical test files: ${group.join(", ")}`);
}

if (errors.length) {
  for (const e of errors) console.error(`::error::${e}`);
  console.error(`\n${errors.length} problem(s) found.`);
  process.exit(1);
}

console.log(
  `OK — ${hooks.length} hooks · ${items.length} registry items · ` +
    `docs ${docs.length} · demos ${demos.length} · tests ${tests.length} · all consistent.`,
);
