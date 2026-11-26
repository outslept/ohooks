import fs from "node:fs/promises";
import path from "node:path";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Steps, Step, StepSource } from "@/components/ui/steps";
import {
  HookInstallationCli,
  type PackageManagerCommand,
} from "@/components/hook-installation-cli";
import { registryBaseUrl as defaultRegistryBaseUrl } from "@/lib/shared";

export interface HookInstallationProps {
  name: string;
  code?: string;
  registryBaseUrl?: string;
}

interface ResolvedManualFile {
  title: string;
  code: string;
}

function kebabToCamel(str: string): string {
  return str.replace(/-([a-z0-9])/g, (_, char: string) => char.toUpperCase());
}

function usesDomTargetUtils(content: string): boolean {
  const utilsImportRegex =
    /import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+['"](?:@\/lib\/utils|\.\.\/lib\/utils)['"]/g;

  for (const match of content.matchAll(utilsImportRegex)) {
    const importedMembers = match[1] ?? "";
    if (
      /\bresolveTargetElement\b/.test(importedMembers) ||
      /\bisRefObject\b/.test(importedMembers)
    ) {
      return true;
    }
  }

  return false;
}

function extractInternalHookDeps(content: string, selfName: string): string[] {
  const deps = new Set<string>();
  const hookImportRegex = /from\s+['"](?:@\/hooks\/|\.\.?\/)(use[A-Za-z0-9]+)['"]/g;

  for (const match of content.matchAll(hookImportRegex)) {
    const dep = match[1];
    if (dep && dep !== selfName) {
      deps.add(dep);
    }
  }

  return Array.from(deps);
}

async function readHookFile(name: string): Promise<{ fileName: string; content: string } | null> {
  const camelName = kebabToCamel(name);
  const candidates = Array.from(new Set([camelName, name]));

  for (const candidate of candidates) {
    try {
      const filePath = path.join(process.cwd(), "hooks", `${candidate}.ts`);
      const content = await fs.readFile(filePath, "utf-8");
      return { fileName: candidate, content };
    } catch {}
  }

  return null;
}

async function resolveManualFiles(
  name: string,
  explicitCode?: string,
): Promise<{
  mainFile: ResolvedManualFile;
  dependencyFiles: ResolvedManualFile[];
}> {
  const camelName = kebabToCamel(name);

  if (explicitCode) {
    return {
      mainFile: {
        title: `hooks/${camelName}.ts`,
        code: explicitCode.trim(),
      },
      dependencyFiles: [],
    };
  }

  const rootHook = await readHookFile(name);
  if (!rootHook) {
    return {
      mainFile: {
        title: `hooks/${camelName}.ts`,
        code: `// Could not resolve source for "${name}" in /hooks/${camelName}.ts`,
      },
      dependencyFiles: [],
    };
  }

  const visitedHooks = new Set<string>([rootHook.fileName]);
  const orderedHookDeps: ResolvedManualFile[] = [];
  let needsDomUtils = usesDomTargetUtils(rootHook.content);

  async function collectDeps(sourceContent: string, currentName: string) {
    if (usesDomTargetUtils(sourceContent)) {
      needsDomUtils = true;
    }

    const deps = extractInternalHookDeps(sourceContent, currentName);
    for (const dep of deps) {
      if (visitedHooks.has(dep)) continue;
      visitedHooks.add(dep);

      const depFile = await readHookFile(dep);
      if (depFile) {
        await collectDeps(depFile.content, depFile.fileName);
        orderedHookDeps.push({
          title: `hooks/${depFile.fileName}.ts`,
          code: depFile.content.trim(),
        });
      }
    }
  }

  await collectDeps(rootHook.content, rootHook.fileName);

  const dependencyFiles: ResolvedManualFile[] = [];

  if (needsDomUtils) {
    try {
      const utilsPath = path.join(process.cwd(), "lib", "utils.ts");
      const utilsContent = await fs.readFile(utilsPath, "utf-8");
      await collectDeps(utilsContent, "utils");
      dependencyFiles.push({
        title: "lib/utils.ts",
        code: utilsContent.trim(),
      });
    } catch {}
  }

  dependencyFiles.push(...orderedHookDeps);

  return {
    mainFile: {
      title: `hooks/${rootHook.fileName}.ts`,
      code: rootHook.content.trim(),
    },
    dependencyFiles,
  };
}

export async function HookInstallation({
  name,
  code,
  registryBaseUrl = defaultRegistryBaseUrl,
}: HookInstallationProps) {
  const { mainFile, dependencyFiles } = await resolveManualFiles(name, code);

  const cleanBaseUrl = registryBaseUrl.replace(/\/$/, "");
  const registryUrl = `${cleanBaseUrl}/${name}.json`;

  const commands: PackageManagerCommand[] = [
    {
      id: "pnpm",
      label: "pnpm",
      group: "standard",
      prefix: "pnpm dlx shadcn@latest add",
      target: registryUrl,
      command: `pnpm dlx shadcn@latest add ${registryUrl}`,
    },
    {
      id: "npm",
      label: "npm",
      group: "standard",
      prefix: "npx shadcn@latest add",
      target: registryUrl,
      command: `npx shadcn@latest add ${registryUrl}`,
    },
    {
      id: "yarn",
      label: "yarn",
      group: "standard",
      prefix: "yarn dlx shadcn@latest add",
      target: registryUrl,
      command: `yarn dlx shadcn@latest add ${registryUrl}`,
    },
    {
      id: "bun",
      label: "bun",
      group: "standard",
      prefix: "bunx --bun shadcn@latest add",
      target: registryUrl,
      command: `bunx --bun shadcn@latest add ${registryUrl}`,
    },
    {
      id: "deno",
      label: "deno",
      group: "modern",
      prefix: "deno run -A npm:shadcn@latest add",
      target: registryUrl,
      command: `deno run -A npm:shadcn@latest add ${registryUrl}`,
    },
    {
      id: "ni",
      label: "ni",
      group: "modern",
      prefix: "nlx shadcn@latest add",
      target: registryUrl,
      command: `nlx shadcn@latest add ${registryUrl}`,
    },
    {
      id: "vlt",
      label: "vlt",
      group: "modern",
      prefix: "vlx shadcn@latest add",
      target: registryUrl,
      command: `vlx shadcn@latest add ${registryUrl}`,
    },
    {
      id: "vp",
      label: "vp",
      group: "modern",
      prefix: "vp dlx shadcn@latest add",
      target: registryUrl,
      command: `vp dlx shadcn@latest add ${registryUrl}`,
    },
    {
      id: "nub",
      label: "nub",
      group: "modern",
      prefix: "nub shadcn@latest add",
      target: registryUrl,
      command: `nub shadcn@latest add ${registryUrl}`,
    },
    {
      id: "upm",
      label: "upm",
      group: "modern",
      prefix: "upm dlx shadcn@latest add",
      target: registryUrl,
      command: `upm dlx shadcn@latest add ${registryUrl}`,
    },
  ];

  return (
    <div className="my-6">
      <Tabs defaultValue="cli" variant="underline">
        <TabsList>
          <TabsTrigger value="cli">CLI</TabsTrigger>
          <TabsTrigger value="manual">Manual</TabsTrigger>
        </TabsList>

        <TabsContent value="cli" className="mt-4">
          <HookInstallationCli commands={commands} />
        </TabsContent>

        <TabsContent value="manual" className="mt-3">
          <Steps>
            {dependencyFiles.length > 0 && (
              <Step
                label="Install required internal dependencies"
                description="This hook relies on the following internal files."
              >
                {dependencyFiles.map((dep) => (
                  <DynamicCodeBlock
                    key={dep.title}
                    lang="ts"
                    code={dep.code}
                    codeblock={{
                      title: dep.title,
                    }}
                  />
                ))}
              </Step>
            )}

            <Step
              label="Copy and paste the hook into your project"
              description={`Create ${mainFile.title} and paste the source code below.`}
            >
              <DynamicCodeBlock
                lang="ts"
                code={mainFile.code}
                codeblock={{
                  title: mainFile.title,
                }}
              />
            </Step>

            <Step
              label="Update the import paths to match your project setup"
              description="Adjust any alias or relative imports to fit your directory structure."
            />
          </Steps>
        </TabsContent>
      </Tabs>
    </div>
  );
}
