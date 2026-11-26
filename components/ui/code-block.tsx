"use client";

import * as React from "react";
import { Check, ChevronDown, Code, Copy } from "lucide-react";
import { cn } from "cn";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSize, type SizeStep } from "@/context/size-context";

export type IconComponent = React.ComponentType<{ className?: string }>;

export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  lang?: string;
  icon?: IconComponent;
  code?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  collapsedHeight?: number;
  showLineNumbers?: boolean;
  hideHeader?: boolean;
  size?: SizeStep;
}

export const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(function CodeBlock(
  {
    title,
    lang,
    icon: Icon,
    code,
    collapsible = false,
    defaultCollapsed = true,
    collapsed: controlledCollapsed,
    onCollapsedChange,
    collapsedHeight = 220,
    showLineNumbers = true,
    hideHeader = false,
    size: sizeProp,
    className,
    children,
    ...props
  },
  forwardedRef,
) {
  const { size } = useSize(sizeProp);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef],
  );

  const [uncontrolledCollapsed, setUncontrolledCollapsed] =
    React.useState<boolean>(defaultCollapsed);
  const isCollapsed = controlledCollapsed ?? uncontrolledCollapsed;

  const [contentHeight, setContentHeight] = React.useState<number | null>(null);
  const [isOverflowing, setIsOverflowing] = React.useState<boolean>(false);
  const [copied, setCopied] = React.useState<boolean>(false);
  const copyTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const updateMetrics = () => {
      const fullHeight = el.scrollHeight;
      setContentHeight(fullHeight);
      setIsOverflowing(fullHeight > collapsedHeight + 48);
    };

    updateMetrics();

    const observer = new ResizeObserver(updateMetrics);
    observer.observe(el);
    return () => observer.disconnect();
  }, [collapsedHeight, children, code]);

  React.useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const toggleCollapsed = React.useCallback(() => {
    const next = !isCollapsed;

    if (next && rootRef.current) {
      const rect = rootRef.current.getBoundingClientRect();
      if (rect.top < 64) {
        rootRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }

    if (controlledCollapsed === undefined) {
      setUncontrolledCollapsed(next);
    }
    onCollapsedChange?.(next);
  }, [isCollapsed, controlledCollapsed, onCollapsedChange]);

  const handleCopy = React.useCallback(async () => {
    const rawText = code ?? contentRef.current?.innerText?.trim() ?? "";
    if (!rawText) return;

    try {
      await navigator.clipboard.writeText(rawText);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {}
  }, [code]);

  const canCollapse = collapsible && isOverflowing;
  const currentlyClipped = canCollapse && isCollapsed;
  const showHeader = !hideHeader && Boolean(title || lang || Icon);
  const iconSizeClass = size === "compact" ? "size-3.5" : "size-4";
  const footerHeight = size === "compact" ? 32 : 36;

  const renderCopyButton = (floating: boolean) => (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy code"}
      title={copied ? "Copied" : "Copy code"}
      className={cn(
        "group/copy relative grid shrink-0 place-items-center leading-none text-muted-foreground select-none outline-none",
        "transition-[transform,background-color,border-color,color,opacity,box-shadow] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
        "active:scale-[0.95] motion-reduce:transition-none motion-reduce:active:scale-100",
        "focus-visible:ring-2 focus-visible:ring-ring",
        floating
          ? [
              "rounded-lg border border-border-subtle bg-control/90 shadow-control backdrop-blur-xs",
              "pointer-hover:hover:border-border-hover pointer-hover:hover:bg-control pointer-hover:hover:text-foreground",
              size === "compact" ? "size-6.5" : "size-7.5",
            ]
          : [
              "rounded-md",
              "pointer-hover:hover:bg-accent pointer-hover:hover:text-foreground",
              size === "compact" ? "size-6" : "size-7",
            ],
      )}
    >
      <Copy
        aria-hidden="true"
        strokeWidth={1.75}
        className={cn(
          "col-start-1 row-start-1 shrink-0 transition-[opacity,transform,filter] duration-180 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
          iconSizeClass,
          copied ? "scale-[0.85] opacity-0 blur-[2px]" : "scale-100 opacity-100 blur-0",
        )}
      />

      <Check
        aria-hidden="true"
        strokeWidth={2.25}
        className={cn(
          "col-start-1 row-start-1 shrink-0 text-success transition-[opacity,transform,filter] duration-180 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
          iconSizeClass,
          copied ? "scale-100 opacity-100 blur-0" : "scale-[0.85] opacity-0 blur-[2px]",
        )}
      />
    </button>
  );

  return (
    <div
      ref={setRefs}
      data-slot="code-block"
      data-size={size}
      data-line-numbers={showLineNumbers ? "true" : "false"}
      data-collapsed={currentlyClipped ? "true" : "false"}
      className={cn(
        "not-prose group/code-block relative flex w-full flex-col overflow-hidden rounded-xl",
        "border border-border bg-code text-foreground",
        className,
      )}
      {...props}
    >
      {showHeader ? (
        <div
          className={cn(
            "flex items-center justify-between border-b border-border-subtle bg-code-header",
            size === "compact" ? "h-7 px-2.5 text-xs" : "h-9 px-3 text-ui",
          )}
        >
          <div className="flex min-w-0 items-center gap-2">
            {Icon ? (
              <Icon
                aria-hidden="true"
                className={cn("shrink-0 text-muted-foreground", iconSizeClass)}
              />
            ) : (
              <Code
                aria-hidden="true"
                className={cn("shrink-0 text-muted-foreground/75", iconSizeClass)}
              />
            )}

            {title && <span className="truncate font-medium text-foreground/85">{title}</span>}

            {lang && (
              <span className="rounded-xs bg-subtle px-1.5 py-0.5 font-mono text-3xs font-medium uppercase text-muted-foreground">
                {lang}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">{renderCopyButton(false)}</div>
        </div>
      ) : (
        <div className=" absolute top-2.5 right-2.5 z-20 inline-flex items-center justify-center opacity-0 transition-opacity duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] group-focus-within/code-block:opacity-100 pointer-hover:group-hover/code-block:opacity-100">
          {renderCopyButton(true)}
        </div>
      )}

      <div
        style={{
          maxHeight: canCollapse
            ? isCollapsed
              ? `${collapsedHeight}px`
              : contentHeight
                ? `${contentHeight + footerHeight}px`
                : undefined
            : undefined,
        }}
        className={cn(
          "relative w-full overflow-hidden",
          canCollapse && [
            "transition-[max-height] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
            isCollapsed ? "duration-190" : "duration-240",
          ],
        )}
      >
        <ScrollArea
          orientation="horizontal"
          className="w-full"
          viewportClassName="scroll-fade-x overscroll-x-contain"
        >
          <div
            ref={contentRef}
            className={cn(
              "min-w-full w-fit font-mono",
              size === "compact" ? "px-3 pt-3 text-xs/5" : "px-4 pt-3.5 text-ui/[22px]",
              canCollapse
                ? size === "compact"
                  ? "pb-10"
                  : "pb-11"
                : size === "compact"
                  ? "pb-3"
                  : "pb-3.5",
            )}
          >
            {children ?? (
              <pre>
                <code>
                  {(code ?? "").split("\n").map((line, i) => (
                    <span key={i} className="line">
                      {line}
                    </span>
                  ))}
                </code>
              </pre>
            )}
          </div>
        </ScrollArea>

        {canCollapse && (
          <>
            <div
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-code via-code/90 to-transparent",
                "transition-opacity duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
                size === "compact" ? "h-20" : "h-24",
                isCollapsed ? "opacity-100" : "opacity-0",
              )}
            />

            <div
              className={cn(
                "absolute inset-x-0 bottom-0 z-20 flex items-center justify-center",
                "transition-[background-color,border-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
                isCollapsed
                  ? "border-t border-transparent bg-transparent"
                  : "border-t border-border-subtle bg-code-header/75 backdrop-blur-xs",
                size === "compact" ? "h-8" : "h-9",
              )}
            >
              <button
                type="button"
                onClick={toggleCollapsed}
                aria-expanded={!isCollapsed}
                className={cn(
                  "group/collapse-btn flex size-full items-center justify-center select-none outline-none",
                  "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                )}
              >
                <span
                  className={cn(
                    "inline-flex items-center justify-center rounded-full border px-3 font-medium text-muted-foreground",
                    "transition-[transform,background-color,border-color,color,box-shadow] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)]",
                    "group-active/collapse-btn:scale-[0.97] motion-reduce:transition-none motion-reduce:group-active/collapse-btn:scale-100",
                    "pointer-hover:group-hover/collapse-btn:text-foreground",
                    isCollapsed
                      ? "border-border-subtle bg-control/95 shadow-control backdrop-blur-xs pointer-hover:group-hover/collapse-btn:border-border-hover pointer-hover:group-hover/collapse-btn:bg-control"
                      : "border-transparent bg-transparent shadow-none pointer-hover:group-hover/collapse-btn:bg-accent/60",
                    size === "compact" ? "h-6 text-2xs" : "h-6.5 text-xs",
                  )}
                >
                  <span className="relative inline-grid items-center justify-items-center">
                    <span
                      className={cn(
                        "col-start-1 row-start-1 inline-flex items-center gap-1.5",
                        "transition-[opacity,transform,filter] duration-180 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
                        isCollapsed
                          ? "translate-y-0 scale-100 opacity-100 blur-0"
                          : "-translate-y-1 scale-95 opacity-0 blur-[2px]",
                      )}
                    >
                      <span>Expand code</span>
                      <ChevronDown aria-hidden="true" className="size-3.5 shrink-0" />
                    </span>

                    <span
                      className={cn(
                        "col-start-1 row-start-1 inline-flex items-center gap-1.5",
                        "transition-[opacity,transform,filter] duration-180 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
                        !isCollapsed
                          ? "translate-y-0 scale-100 opacity-100 blur-0"
                          : "translate-y-1 scale-95 opacity-0 blur-[2px]",
                      )}
                    >
                      <span>Collapse code</span>
                      <ChevronDown aria-hidden="true" className="size-3.5 shrink-0 rotate-180" />
                    </span>
                  </span>
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
});
