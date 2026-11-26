"use client";

import * as React from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "cn";
import { useSize, type SizeStep } from "@/context/size-context";

const Select = BaseSelect.Root;

const SelectGroup = BaseSelect.Group;

const SelectValue = BaseSelect.Value;

interface SelectHighlightContextValue {
  reportHover: (el: HTMLElement) => void;
}

const SelectHighlightContext = React.createContext<SelectHighlightContextValue | null>(null);

export interface SelectTriggerProps extends React.ComponentPropsWithoutRef<
  typeof BaseSelect.Trigger
> {
  variant?: "bordered" | "borderless";
  size?: SizeStep;
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, variant = "bordered", size: sizeProp, ...props }, ref) => {
    const { size } = useSize(sizeProp);
    const isCompact = size === "compact";

    return (
      <BaseSelect.Trigger
        ref={ref}
        data-slot="select-trigger"
        data-variant={variant}
        data-size={size}
        className={cn(
          "group inline-flex items-center justify-between gap-2 font-sans font-normal text-foreground outline-none select-none",
          "transition-[border-color,box-shadow,color,transform] duration-150 ease-out-cubic",
          "disabled:pointer-events-none disabled:opacity-40",
          isCompact
            ? "h-7 rounded-md text-xs [&_svg]:size-3.5"
            : "h-9 rounded-lg text-compact [&_svg]:size-4",
          variant === "bordered" && [
            "w-full border border-border bg-control shadow-control",
            isCompact ? "px-2.5" : "px-3",
            "pointer-hover:hover:border-border-hover",
            "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20",
            "data-popup-open:border-border-hover",
          ],
          variant === "borderless" && [
            "w-auto bg-transparent text-muted-foreground",
            isCompact ? "px-1.5" : "px-2",
            "pointer-hover:hover:text-foreground",
            "focus-visible:ring-2 focus-visible:ring-ring/20",
            "data-popup-open:text-foreground",
          ],
          className,
        )}
        {...props}
      >
        <span className="truncate">{children}</span>
        <BaseSelect.Icon className="shrink-0 text-muted-foreground transition-transform duration-200 ease-out-cubic group-data-popup-open:rotate-180 group-data-popup-open:text-foreground">
          <ChevronDown />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
    );
  },
);
SelectTrigger.displayName = "SelectTrigger";

export interface SelectContentProps extends React.ComponentPropsWithoutRef<
  typeof BaseSelect.Popup
> {
  align?: BaseSelect.Positioner.Props["align"];
  side?: BaseSelect.Positioner.Props["side"];
  sideOffset?: BaseSelect.Positioner.Props["sideOffset"];
  alignItemWithTrigger?: BaseSelect.Positioner.Props["alignItemWithTrigger"];
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  (
    {
      className,
      children,
      align = "start",
      side = "bottom",
      sideOffset = 6,
      alignItemWithTrigger = false,
      ...props
    },
    ref,
  ) => {
    const [highlight, setHighlight] = React.useState<{
      top: number;
      height: number;
      visible: boolean;
    }>({ top: 0, height: 0, visible: false });

    const reportHover = React.useCallback((el: HTMLElement) => {
      setHighlight({
        top: el.offsetTop,
        height: el.offsetHeight,
        visible: true,
      });
    }, []);

    const handleMouseLeave = React.useCallback(() => {
      setHighlight((prev) => ({ ...prev, visible: false }));
    }, []);

    const contextValue = React.useMemo(() => ({ reportHover }), [reportHover]);

    return (
      <BaseSelect.Portal>
        <BaseSelect.Positioner
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignItemWithTrigger={alignItemWithTrigger}
          className="z-50 outline-none select-none"
        >
          <BaseSelect.Popup
            ref={ref}
            data-slot="select-content"
            onMouseLeave={handleMouseLeave}
            className={cn(
              "relative z-50 min-w-[max(var(--anchor-width),180px)] max-h-(--available-height) overflow-y-auto overflow-x-hidden",
              "rounded-xl bg-popover/95 backdrop-blur-popover p-1 text-popover-foreground",
              "shadow-popover ring-1 ring-border-subtle outline-none",
              "origin-(--transform-origin) transition-[transform,opacity] duration-150 ease-out-cubic",
              "data-starting-style:scale-95 data-starting-style:opacity-0",
              "data-ending-style:scale-95 data-ending-style:opacity-0",
              className,
            )}
            {...props}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-1 top-0 z-0 rounded-lg bg-accent transition-[transform,height,opacity] duration-150 ease-out-expo"
              style={{
                height: `${highlight.height}px`,
                transform: `translateY(${highlight.top}px)`,
                opacity: highlight.visible ? 1 : 0,
              }}
            />
            <SelectHighlightContext.Provider value={contextValue}>
              <BaseSelect.List className="relative z-10 flex flex-col gap-0.5 outline-none">
                {children}
              </BaseSelect.List>
            </SelectHighlightContext.Provider>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    );
  },
);
SelectContent.displayName = "SelectContent";

type SelectItemProps = React.ComponentPropsWithoutRef<typeof BaseSelect.Item>;

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, onMouseMove, onFocus, ...props }, ref) => {
    const { size } = useSize();
    const isCompact = size === "compact";
    const highlightCtx = React.useContext(SelectHighlightContext);

    const handleMouseMove = React.useCallback<NonNullable<SelectItemProps["onMouseMove"]>>(
      (e) => {
        highlightCtx?.reportHover(e.currentTarget);
        onMouseMove?.(e);
      },
      [highlightCtx, onMouseMove],
    );

    const handleFocus = React.useCallback<NonNullable<SelectItemProps["onFocus"]>>(
      (e) => {
        highlightCtx?.reportHover(e.currentTarget);
        onFocus?.(e);
      },
      [highlightCtx, onFocus],
    );

    return (
      <BaseSelect.Item
        ref={ref}
        data-slot="select-item"
        onMouseMove={handleMouseMove}
        onFocus={handleFocus}
        className={cn(
          "relative flex w-full cursor-default items-center justify-between gap-4 rounded-lg font-sans outline-none select-none",
          "text-muted-foreground transition-colors duration-100",
          "data-highlighted:text-accent-foreground",
          "data-selected:font-medium data-selected:text-foreground",
          "data-disabled:pointer-events-none data-disabled:opacity-40",
          isCompact ? "min-h-7 px-2 py-1 text-xs" : "min-h-8 px-2.5 py-1.5 text-compact",
          className,
        )}
        {...props}
      >
        <BaseSelect.ItemText className="truncate">{children}</BaseSelect.ItemText>
        <BaseSelect.ItemIndicator className="flex shrink-0 items-center justify-center text-foreground animate-in fade-in-0 zoom-in-75 duration-150">
          <Check className={isCompact ? "size-3.5 stroke-[2.25]" : "size-4 stroke-[2.25]"} />
        </BaseSelect.ItemIndicator>
      </BaseSelect.Item>
    );
  },
);
SelectItem.displayName = "SelectItem";

const SelectGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BaseSelect.GroupLabel>
>(({ className, ...props }, ref) => (
  <BaseSelect.GroupLabel
    ref={ref}
    data-slot="select-group-label"
    className={cn(
      "px-2.5 pt-2 pb-1 text-[11px] font-medium tracking-wider text-muted-foreground/70 uppercase select-none",
      className,
    )}
    {...props}
  />
));
SelectGroupLabel.displayName = "SelectGroupLabel";

const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof BaseSelect.Separator>
>(({ className, ...props }, ref) => (
  <BaseSelect.Separator
    ref={ref}
    data-slot="select-separator"
    className={cn("-mx-1 my-1 h-px bg-border-subtle", className)}
    {...props}
  />
));
SelectSeparator.displayName = "SelectSeparator";

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectGroupLabel,
  SelectSeparator,
};
