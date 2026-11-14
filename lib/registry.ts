import fs from 'node:fs';
import path from 'node:path';
import { appName, appUrl, registryBaseUrl } from '@/lib/shared';

const ROOT_DIR = process.cwd();
const HOOKS_DIR = path.join(ROOT_DIR, 'hooks');
const UTILS_FILE = path.join(ROOT_DIR, 'lib', 'utils.ts');

export type RegistryItemType = 'registry:hook' | 'registry:lib';

export interface RegistryFile {
  path: string;
  type: RegistryItemType;
  target: string;
  content?: string;
}

export interface RegistryItem {
  $schema?: string;
  name: string;
  type: RegistryItemType;
  title: string;
  description: string;
  categories?: string[];
  registryDependencies?: string[];
  files: RegistryFile[];
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

function extractHookMetadata(
  content: string,
  hookName: string
): { description: string; categories?: string[] } {
  const escapedName = escapeRegExp(hookName);
  const hookJsdocRegex = new RegExp(
    `\\/\\*\\*((?:(?!\\*\\/)[\\s\\S])*?)\\*\\/\\s*export\\s+(?:async\\s+)?(?:function|const)\\s+${escapedName}\\b`
  );

  const match = content.match(hookJsdocRegex);
  if (!match?.[1]) {
    return { description: `React hook ${hookName}.` };
  }

  const lines = match[1]
    .split('\n')
    .map((line) => line.replace(/^\s*\*\s?/, '').trim());

  const descriptionParts: string[] = [];
  const categories: string[] = [];
  let seenTag = false;

  for (const line of lines) {
    if (line.startsWith('@')) {
      seenTag = true;
      const categoryMatch = line.match(/^@category\s+(.+)$/i);
      if (categoryMatch?.[1]) {
        categories.push(categoryMatch[1].trim().toLowerCase());
      }
      continue;
    }

    if (!seenTag && line.length > 0) {
      descriptionParts.push(line);
    }
  }

  const description =
    descriptionParts.join(' ').trim() || `React hook ${hookName}.`;

  return {
    description,
    ...(categories.length > 0 ? { categories } : {}),
  };
}

function usesDomTargetUtils(content: string): boolean {
  const utilsImportRegex =
    /import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+['"](?:@\/lib\/utils|\.\.\/lib\/utils)['"]/g;

  for (const match of content.matchAll(utilsImportRegex)) {
    const importedMembers = match[1] ?? '';
    if (
      /\bresolveTargetElement\b/.test(importedMembers) ||
      /\bisRefObject\b/.test(importedMembers)
    ) {
      return true;
    }
  }

  return false;
}

function extractDependencies(content: string, selfName: string): string[] {
  const deps = new Set<string>();

  if (usesDomTargetUtils(content)) {
    deps.add(`${registryBaseUrl}/utils.json`);
  }

  const hookImportRegex =
    /from\s+['"](?:@\/hooks\/|\.\.?\/)(use[A-Za-z0-9]+)['"]/g;

  for (const match of content.matchAll(hookImportRegex)) {
    const dep = match[1];
    if (dep && dep !== selfName) {
      deps.add(`${registryBaseUrl}/${dep}.json`);
    }
  }

  return Array.from(deps);
}

export function getAllRegistryItems(): RegistryItem[] {
  const files = fs
    .readdirSync(HOOKS_DIR)
    .filter((file) => file.endsWith('.ts') && file !== 'index.ts')
    .sort((a, b) => a.localeCompare(b));

  const hookItems: RegistryItem[] = files.map((file) => {
    const hookName = path.basename(file, '.ts');
    const fullPath = path.join(HOOKS_DIR, file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const { description, categories } = extractHookMetadata(content, hookName);
    const registryDependencies = extractDependencies(content, hookName);

    return {
      name: hookName,
      type: 'registry:hook',
      title: hookName,
      description,
      ...(categories ? { categories } : {}),
      ...(registryDependencies.length > 0 ? { registryDependencies } : {}),
      files: [
        {
          path: `hooks/${file}`,
          type: 'registry:hook',
          target: `@hooks/${file}`,
          content,
        },
      ],
    };
  });

  let utilsItem: RegistryItem | null = null;
  if (fs.existsSync(UTILS_FILE)) {
    const utilsContent = fs.readFileSync(UTILS_FILE, 'utf-8');
    const utilsDeps = extractDependencies(utilsContent, 'utils');

    utilsItem = {
      name: 'utils',
      type: 'registry:lib',
      title: 'DOM Target Utilities',
      description:
        'Utilities (resolveTargetElement, isRefObject) for resolving DOM elements and React refs.',
      ...(utilsDeps.length > 0 ? { registryDependencies: utilsDeps } : {}),
      files: [
        {
          path: 'lib/utils.ts',
          type: 'registry:lib',
          target: '@lib/utils.ts',
          content: utilsContent,
        },
      ],
    };
  }

  const allBundle: RegistryItem = {
    name: 'all',
    type: 'registry:hook',
    title: 'All Hooks',
    description: 'Complete collection of all ohook React hooks and utilities.',
    files: [
      ...(utilsItem ? utilsItem.files : []),
      ...hookItems.flatMap((item) => item.files),
    ],
  };

  return [...(utilsItem ? [utilsItem] : []), ...hookItems, allBundle];
}

export function getRegistryCatalog() {
  const items = getAllRegistryItems().map((item) => ({
    ...item,
    files: item.files.map(({ content: _content, ...rest }) => rest),
  }));

  return {
    $schema: 'https://ui.shadcn.com/schema/registry.json',
    name: appName,
    homepage: appUrl,
    items,
  };
}

export function getRegistryItemByName(rawName: string): RegistryItem | null {
  const cleanName = rawName.replace(/\.json$/i, '');
  const items = getAllRegistryItems();

  for (const item of items) {
    if (item.name === cleanName) {
      return {
        $schema: 'https://ui.shadcn.com/schema/registry-item.json',
        ...item,
      };
    }

    const kebab = toKebabCase(item.name);
    if (kebab === cleanName) {
      return {
        $schema: 'https://ui.shadcn.com/schema/registry-item.json',
        ...item,
        name: kebab,
      };
    }
  }

  return null;
}
