"use client";

import * as React from "react";
import Link from "next/link";
import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "cn";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface ParameterNode {
  name: string;
  description?: React.ReactNode;
  type?: React.ReactNode;
}

export interface TypeNode {
  description?: React.ReactNode;
  type: React.ReactNode;
  typeDescription?: React.ReactNode;
  typeDescriptionLink?: string;
  default?: React.ReactNode;
  required?: boolean;
  optional?: boolean;
  deprecated?: boolean;
  parameters?: ParameterNode[];
  returns?: React.ReactNode;
}

export interface TypeTableProps extends React.ComponentPropsWithoutRef<"div"> {
  type: Record<string, TypeNode>;
  title?: string;
}

function renderInlineCode(node: React.ReactNode): React.ReactNode {
  if (typeof node !== "string" || !node.includes("`")) {
    return node;
  }

  const parts = node.split(/(`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={index}
          className="rounded-xs border border-border-subtle bg-subtle/80 px-1 py-0.5 font-mono text-2xs text-foreground"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export function TypeTable({ type, title, className, ...props }: TypeTableProps) {
  const entries = Object.entries(type);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div
      data-slot="type-table"
      className={cn(
        "not-prose my-6 overflow-hidden rounded-xl border border-border-subtle bg-subtle/50 p-1",
        className,
      )}
      {...props}
    >
      <div className="overflow-hidden rounded-lg border border-border-subtle/80 bg-card text-card-foreground shadow-control">
        {title && (
          <div className="flex items-center border-b border-border-subtle bg-code-header/60 px-4 py-2">
            <code className="font-mono text-xs font-semibold tracking-tight text-foreground">
              {title}
            </code>
          </div>
        )}

        <div className="grid grid-cols-1 border-b border-border-subtle bg-subtle/40 px-4 py-2 text-2xs font-medium tracking-wider text-muted-foreground uppercase sm:grid-cols-[minmax(160px,28%)_1fr] sm:gap-6">
          <div>Property</div>
          <div className="max-sm:hidden">Specification</div>
        </div>

        <div className="divide-y divide-border-subtle">
          {entries.map(([key, item]) => (
            <TypeRow key={key} name={key} field={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TypeRow({ name, field }: { name: string; field: TypeNode }) {
  const hasFullType = Boolean(field.typeDescription) && field.typeDescription !== field.type;
  const hasParameters = Boolean(field.parameters && field.parameters.length > 0);
  const hasReturns = Boolean(field.returns);
  const hasExpandableDetails = hasFullType || hasParameters || hasReturns;

  const isOptional = field.optional !== undefined ? field.optional : field.required === false;

  return (
    <div
      data-slot="type-row"
      className={cn(
        "grid grid-cols-1 gap-2 px-4 py-3.5 sm:grid-cols-[minmax(160px,28%)_1fr] sm:gap-6",
        "transition-colors duration-150 ease-out pointer-hover:hover:bg-subtle/25",
      )}
    >
      <div className="flex flex-wrap items-start gap-1.5 sm:pt-0.5">
        <code
          className={cn(
            "font-mono text-xs font-medium tracking-tight text-foreground",
            field.deprecated && "text-muted-foreground line-through",
          )}
        >
          {name}
          {isOptional && (
            <span
              title="Optional"
              className="ml-0.5 font-normal text-muted-foreground/80 select-none"
            >
              ?
            </span>
          )}
        </code>

        {field.required && (
          <span className="inline-flex items-center rounded-2xs border border-border-subtle bg-subtle/70 px-1 py-px font-mono text-3xs font-medium text-muted-foreground">
            required
          </span>
        )}

        {field.deprecated && (
          <span className="inline-flex items-center rounded-2xs border border-warning/30 bg-warning/10 px-1 py-px font-mono text-3xs font-medium text-warning">
            deprecated
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {field.typeDescriptionLink ? (
            <Link
              href={field.typeDescriptionLink}
              className={cn(
                "inline-flex max-w-full items-center rounded-xs border border-border-subtle bg-subtle/70 px-1.5 py-0.5 font-mono text-2xs wrap-break-word text-foreground underline decoration-border-hover underline-offset-2",
                "transition-[border-color,background-color] duration-150 ease-out pointer-hover:hover:border-border-hover pointer-hover:hover:bg-subtle",
                "active:scale-[0.98] motion-reduce:transition-none",
              )}
            >
              {field.type}
            </Link>
          ) : (
            <span className="inline-flex max-w-full items-center rounded-xs border border-border-subtle bg-subtle/70 px-1.5 py-0.5 font-mono text-2xs wrap-break-word text-foreground">
              {field.type}
            </span>
          )}

          {field.default !== undefined && (
            <span className="inline-flex items-center gap-1 rounded-xs border border-border-subtle bg-control px-1.5 py-0.5 font-mono text-2xs">
              <span className="text-3xs text-muted-foreground select-none">default:</span>
              <span className="font-medium text-foreground">{field.default}</span>
            </span>
          )}
        </div>

        {field.description && (
          <div className="prose-no-margin text-xs leading-relaxed text-muted-foreground">
            {renderInlineCode(field.description)}
          </div>
        )}

        {hasExpandableDetails && (
          <BaseCollapsible.Root className="mt-0.5">
            <BaseCollapsible.Trigger
              className={cn(
                "group/trigger -ml-1.5 inline-flex w-fit items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-2xs font-medium text-muted-foreground outline-none select-none",
                "transition-[color,background-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
                "pointer-hover:hover:bg-subtle/80 pointer-hover:hover:text-foreground",
                "active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100",
                "focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              <span>
                {hasParameters ? `Parameters (${field.parameters!.length})` : "Signature details"}
              </span>
              <ChevronDown
                aria-hidden="true"
                className="size-3 shrink-0 text-muted-foreground/75 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-data-[panel-open]/trigger:rotate-180 group-hover/trigger:text-current"
              />
            </BaseCollapsible.Trigger>

            <BaseCollapsible.Panel
              keepMounted
              className={cn(
                "grid grid-rows-[1fr] overflow-hidden opacity-100",
                "transition-[grid-template-rows,opacity] duration-220 ease-[cubic-bezier(0.23,1,0.32,1)]",
                "data-[starting-style]:grid-rows-[0fr] data-[starting-style]:opacity-0",
                "data-[ending-style]:grid-rows-[0fr] data-[ending-style]:opacity-0 data-[ending-style]:duration-160",
                "motion-reduce:transition-none",
              )}
            >
              <div className="min-h-0">
                <div className="mt-1.5 flex flex-col gap-2.5 rounded-lg border border-border-subtle bg-subtle/40 p-2.5">
                  {hasFullType && (
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-3xs font-medium tracking-wider text-muted-foreground uppercase select-none">
                        Full Signature
                      </span>
                      <ScrollArea
                        orientation="horizontal"
                        className="w-full"
                        viewportClassName="overscroll-x-contain"
                      >
                        <pre className="w-fit min-w-full py-0.5 font-mono text-2xs text-foreground">
                          <code>{field.typeDescription}</code>
                        </pre>
                      </ScrollArea>
                    </div>
                  )}

                  {hasParameters && (
                    <div className="flex flex-col gap-1.5">
                      <span className="font-mono text-3xs font-medium tracking-wider text-muted-foreground uppercase select-none">
                        Parameters
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {field.parameters!.map((param) => (
                          <div
                            key={param.name}
                            className="flex flex-wrap items-baseline gap-1.5 text-xs"
                          >
                            <code className="font-mono text-2xs font-medium text-foreground">
                              {param.name}
                            </code>
                            {param.type && (
                              <span className="rounded-2xs border border-border-subtle bg-control px-1 py-px font-mono text-3xs text-muted-foreground">
                                {param.type}
                              </span>
                            )}
                            {param.description && (
                              <span className="text-xs text-muted-foreground">
                                — {renderInlineCode(param.description)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {hasReturns && (
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-3xs font-medium tracking-wider text-muted-foreground uppercase select-none">
                        Returns
                      </span>
                      <div className="text-xs text-muted-foreground">
                        {renderInlineCode(field.returns)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </BaseCollapsible.Panel>
          </BaseCollapsible.Root>
        )}
      </div>
    </div>
  );
}
