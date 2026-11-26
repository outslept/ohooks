import * as React from "react";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

import { AutoTypeTable, type AutoTypeTableProps } from "@/components/ui/auto-type-table";
import { HookInstallation } from "@/components/hook-installation";
import { HookPreview } from "@/components/hook-preview";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import {
  Step,
  StepDetails,
  StepImage,
  Steps,
  StepsHeader,
  StepSource,
} from "@/components/ui/steps";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TypeTable } from "@/components/ui/type-table";

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    HookInstallation,
    HookPreview,
    CodeBlock,
    AutoTypeTable: (props: AutoTypeTableProps) => <AutoTypeTable {...props} />,
    TypeTable,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    Tab: TabsTrigger,
    Steps,
    StepsHeader,
    Step,
    StepDetails,
    StepSource,
    StepImage,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardAction,
    CardContent,
    CardFooter,
    Badge,
    pre: ({
      title,
      className,
      children,
      ...props
    }: React.ComponentProps<"pre"> & {
      title?: string;
      "data-lang"?: string;
    }) => (
      <CodeBlock
        title={title}
        lang={props["data-lang"]}
        collapsible
        defaultCollapsed={true}
        collapsedHeight={220}
        className="my-4"
      >
        <pre className={className} {...props}>
          {children}
        </pre>
      </CodeBlock>
    ),
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
