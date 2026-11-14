import * as React from "react";
import fs from "node:fs/promises";
import path from "node:path";
import dynamic from "next/dynamic";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { HookPreviewFrame } from "@/components/hook-preview-frame";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface HookPreviewProps {
  name: string;
}

const demoComponentCache = new Map<string, React.ComponentType>();

function getDemoComponent(name: string): React.ComponentType {
  let Component = demoComponentCache.get(name);
  if (!Component) {
    Component = dynamic(() => import(`@/demos/${name}`), {
      loading: () => (
        <div className="flex h-32 items-center justify-center font-mono text-xs text-muted-foreground">
          Loading preview...
        </div>
      ),
    });
    demoComponentCache.set(name, Component);
  }
  return Component;
}

export async function HookPreview({ name }: HookPreviewProps) {
  const demoPath = path.join(process.cwd(), "demos", `${name}.tsx`);
  let code = "";

  try {
    code = await fs.readFile(demoPath, "utf-8");
  } catch {
    code = `// Error: Could not load source file at demos/${name}.tsx`;
  }

  return (
    <Tabs defaultValue="Preview" variant="underline" className="my-6 gap-3">
      <TabsList>
        <TabsTrigger value="Preview">Preview</TabsTrigger>
        <TabsTrigger value="Code">Code</TabsTrigger>
      </TabsList>

      <TabsContent value="Preview">
        <HookPreviewFrame>
          {React.createElement(getDemoComponent(name))}
        </HookPreviewFrame>
      </TabsContent>

      <TabsContent value="Code">
        <div className="not-prose [&_figure]:my-0 [&_figure]:rounded-xl [&_figure]:border-border-subtle [&_figure]:bg-code [&_figure]:shadow-control">
          <DynamicCodeBlock lang="tsx" code={code.trim()} />
        </div>
      </TabsContent>
    </Tabs>
  );
}
