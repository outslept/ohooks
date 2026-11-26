"use client";

import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";

import { cn } from "cn";

const Popover = BasePopover.Root;

const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof BasePopover.Trigger>
>(({ className, ...props }, forwardedRef) => (
  <BasePopover.Trigger
    ref={forwardedRef}
    data-slot="popover-trigger"
    className={cn(
      "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring",
      className,
    )}
    {...props}
  />
));
PopoverTrigger.displayName = "PopoverTrigger";

export interface PopoverContentProps extends React.ComponentPropsWithoutRef<
  typeof BasePopover.Popup
> {
  side?: React.ComponentPropsWithoutRef<typeof BasePopover.Positioner>["side"];
  align?: React.ComponentPropsWithoutRef<typeof BasePopover.Positioner>["align"];
  sideOffset?: number;
  alignOffset?: number;
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  (
    {
      className,
      side = "bottom",
      align = "start",
      sideOffset = 6,
      alignOffset = 0,
      children,
      ...props
    },
    forwardedRef,
  ) => (
    <BasePopover.Portal>
      <BasePopover.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className="z-50 outline-none"
      >
        <BasePopover.Popup
          ref={forwardedRef}
          data-slot="popover-content"
          className={cn(
            "z-50 max-w-md rounded-xl border border-border bg-popover p-3 text-ui text-popover-foreground shadow-popover outline-none",
            "origin-(--transform-origin)",
            "transition-[transform,opacity,filter] duration-150 ease-out",
            "starting:scale-95 starting:opacity-0 starting:blur-xs",
            "data-ending-style:scale-95 data-ending-style:opacity-0 data-ending-style:blur-2xs data-ending-style:duration-100",
            "motion-reduce:transition-none",
            className,
          )}
          {...props}
        >
          {children}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  ),
);
PopoverContent.displayName = "PopoverContent";

const PopoverTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<typeof BasePopover.Title>
>(({ className, ...props }, forwardedRef) => (
  <BasePopover.Title
    ref={forwardedRef}
    data-slot="popover-title"
    className={cn("font-medium text-foreground text-ui", className)}
    {...props}
  />
));
PopoverTitle.displayName = "PopoverTitle";

const PopoverDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof BasePopover.Description>
>(({ className, ...props }, forwardedRef) => (
  <BasePopover.Description
    ref={forwardedRef}
    data-slot="popover-description"
    className={cn("text-muted-foreground text-xs", className)}
    {...props}
  />
));
PopoverDescription.displayName = "PopoverDescription";

const PopoverClose = BasePopover.Close;

export { Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription, PopoverClose };
