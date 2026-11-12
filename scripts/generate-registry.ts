import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, parse } from 'node:path';

const HOOKS_DIR = join(process.cwd(), 'hooks');
const DEP_PREFIX = process.env.REGISTRY_PREFIX ?? 'owner/repo';

function formatDep(depName: string): string {
  if (DEP_PREFIX.startsWith('http')) {
    return `${DEP_PREFIX.replace(/\/$/, '')}/${depName}.json`;
  }
  return `${DEP_PREFIX}/${depName}`;
}

const IMPORT_RE = /from\s+['"]@\/hooks\/(use[A-Za-z0-9]+)['"]/g;
const JSDOC_RE = /\/\*\*\s*\n([\s\S]*?)\*\//;

function extractDescription(source: string, fallback: string): string {
  const match = source.match(JSDOC_RE);
  if (!match) return fallback;
  const lines = match[1]
    .split('\n')
    .map((l) => l.replace(/^\s*\*\s?/, '').trim())
    .filter((l) => l && !l.startsWith('@'));
  return lines[0] || fallback;
}

const files = readdirSync(HOOKS_DIR)
  .filter((f) => f.endsWith('.ts') && f !== 'index.ts')
  .sort();

const items = files.map((file) => {
  const name = parse(file).name;
  const source = readFileSync(join(HOOKS_DIR, file), 'utf8');

  const deps = new Set<string>();
  for (const match of source.matchAll(IMPORT_RE)) {
    if (match[1] !== name) {
      deps.add(formatDep(match[1]));
    }
  }

  return {
    name,
    type: 'registry:hook',
    title: name,
    description: extractDescription(source, `React ${name} hook.`),
    ...(deps.size > 0 ? { registryDependencies: [...deps] } : {}),
    files: [
      {
        path: `hooks/${file}`,
        type: 'registry:hook',
        target: `@hooks/${file}`,
      },
    ],
  };
});

items.push({
  name: 'all',
  type: 'registry:hook',
  title: 'All Hooks',
  description: `All ${files.length} React hooks.`,
  files: files.map((file) => ({
    path: `hooks/${file}`,
    type: 'registry:hook',
    target: `@hooks/${file}`,
  })),
});

const registry = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'hooks',
  homepage: 'https://github.com/owner/repo',
  items,
};

writeFileSync(
  join(process.cwd(), 'registry.json'),
  `${JSON.stringify(registry, null, 2)}\n`
);
console.log(`Generated registry.json with ${items.length} items.`);
