"use client";

import * as React from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { cn } from "cn";
import { useSize, type SizeStep } from "@/context/size-context";

type TabsVariant = "pill" | "underline";

interface TabsStyleContextValue {
  variant: TabsVariant;
  size: SizeStep;
}

const TabsStyleContext = React.createContext<TabsStyleContextValue>({
  variant: "pill",
  size: "default",
});

export interface TabsProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof BaseTabs.Root>,
    "onValueChange"
  > {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: TabsVariant;
  size?: SizeStep;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      variant = "pill",
      size: sizeProp,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { size } = useSize(sizeProp);

    return (
      <TabsStyleContext.Provider value={{ variant, size }}>
        <BaseTabs.Root
          ref={ref}
          data-slot="tabs"
          data-variant={variant}
          data-size={size}
          value={value}
          defaultValue={defaultValue}
          onValueChange={(val) => {
            if (typeof val === "string") {
              onValueChange?.(val);
            }
          }}
          className={cn("flex flex-col", className)}
          {...props}
        >
          {children}
        </BaseTabs.Root>
      </TabsStyleContext.Provider>
    );
  }
);
Tabs.displayName = "Tabs";

export interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof BaseTabs.List> {}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, ...props }, ref) => {
    const { variant, size } = React.useContext(TabsStyleContext);
    const isCompact = size === "compact";

    return (
      <BaseTabs.List
        ref={ref}
        data-slot="tabs-list"
        data-variant={variant}
        data-size={size}
        className={cn(
          "relative inline-flex w-fit items-center select-none",
          variant === "pill" && [
            "rounded-lg bg-subtle border border-border-subtle p-0.5",
            isCompact ? "h-7 gap-0.5" : "h-9 gap-0.5",
          ],
          variant === "underline" && [
            "w-full border-b border-border-subtle gap-5",
            isCompact ? "h-8" : "h-9",
          ],
          className
        )}
        {...props}
      >
        {children}
        <BaseTabs.Indicator
          data-slot="tabs-indicator"
          className={cn(
            "pointer-events-none absolute left-0 transition-all duration-200 ease-out-expo",
            "translate-x-(--active-tab-left) w-(--active-tab-width)",
            variant === "pill" &&
              "top-0.5 bottom-0.5 z-0 rounded-[calc(var(--radius-lg)-2px)] bg-control shadow-2xs ring-1 ring-border-subtle/80",
            variant === "underline" && "-bottom-px z-10 h-0.5 bg-foreground"
          )}
        />
      </BaseTabs.List>
    );
  }
);
TabsList.displayName = "TabsList";

export interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof BaseTabs.Tab> {
  value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, disabled = false, children, ...props }, ref) => {
    const { variant, size } = React.useContext(TabsStyleContext);
    const isCompact = size === "compact";

    return (
      <BaseTabs.Tab
        ref={ref}
        value={value}
        disabled={disabled}
        data-slot="tabs-trigger"
        data-variant={variant}
        data-size={size}
        className={cn(
          "relative z-10 inline-flex items-center justify-center whitespace-nowrap font-sans font-medium transition-colors duration-150 ease-out-cubic select-none outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
          "data-disabled:pointer-events-none data-disabled:opacity-40",
          "text-muted-foreground pointer-hover:hover:text-foreground data-selected:text-foreground",
          variant === "pill" && [
            "h-full rounded-[calc(var(--radius-lg)-2px)]",
            isCompact ? "px-2.5 text-xs" : "px-3 text-compact",
          ],
          variant === "underline" && [
            "h-full px-0.5",
            isCompact ? "text-xs" : "text-compact",
          ],
          className
        )}
        {...props}
      >
        {children}
      </BaseTabs.Tab>
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

export interface TabsContentProps
  extends React.ComponentPropsWithoutRef<typeof BaseTabs.Panel> {
  value: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    return (
      <BaseTabs.Panel
        ref={ref}
        value={value}
        data-slot="tabs-content"
        className={cn(
          "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          className
        )}
        {...props}
      >
        {children}
      </BaseTabs.Panel>
    );
  }
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
