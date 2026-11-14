"use client";

import * as React from "react";
import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";
import { cva } from "class-variance-authority";
import { cn } from "cn";

export type ScrollAreaOrientation = "vertical" | "horizontal" | "both";

const scrollbarVariants = cva(
  [
    "group/scrollbar absolute z-20 flex touch-none select-none",
    "[@media(pointer:coarse)]:hidden",
    "opacity-0 transition-opacity duration-150 ease-out",
    "data-[hovering]:opacity-100 data-[scrolling]:opacity-100 data-[dragging]:opacity-100",
  ],
  {
    variants: {
      orientation: {
        vertical: "top-0 right-0 h-full w-3 flex-col py-1 pr-1 pl-0.5",
        horizontal: "bottom-0 left-0 h-3 w-full flex-row px-1 pb-1 pt-0.5",
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  }
);

const thumbVariants = cva(
  [
    "relative flex-1 rounded-thumb",
    "bg-foreground/16",
    "group-data-[hovering]/scrollbar:bg-foreground/26",
    "group-data-[scrolling]/scrollbar:bg-foreground/38",
    "pointer-hover:group-hover/scrollbar:bg-foreground/48",
    "data-[dragging]:bg-foreground/60",
    "transition-[transform,background-color] duration-150 ease-out",
    "motion-reduce:transition-none",
  ],
  {
    variants: {
      orientation: {
        vertical: [
          "w-full origin-right scale-x-[0.55]",
          "pointer-hover:group-hover/scrollbar:scale-x-100",
          "data-[dragging]:scale-x-100",
        ],
        horizontal: [
          "h-full origin-bottom scale-y-[0.55]",
          "pointer-hover:group-hover/scrollbar:scale-y-100",
          "data-[dragging]:scale-y-100",
        ],
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  }
);

export interface ScrollAreaProps
  extends React.ComponentPropsWithoutRef<typeof BaseScrollArea.Root> {
  orientation?: ScrollAreaOrientation;
  viewportClassName?: string;
  className?: string;
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  function ScrollArea(
    {
      orientation = "vertical",
      viewportClassName,
      className,
      children,
      ...otherProps
    },
    forwardedRef
  ) {
    const showVertical = orientation === "vertical" || orientation === "both";
    const showHorizontal =
      orientation === "horizontal" || orientation === "both";

    return (
      <BaseScrollArea.Root
        ref={forwardedRef}
        data-slot="scroll-area"
        data-orientation={orientation}
        className={cn("relative overflow-hidden", className)}
        {...otherProps}
      >
        <BaseScrollArea.Viewport
          data-slot="scroll-area-viewport"
          className={cn(
            "size-full overscroll-contain rounded-[inherit] outline-none",
            "scrollbar-none [&::-webkit-scrollbar]:hidden",
            viewportClassName
          )}
        >
          {children}
        </BaseScrollArea.Viewport>

        {showVertical && <ScrollBar orientation="vertical" />}
        {showHorizontal && <ScrollBar orientation="horizontal" />}
        {orientation === "both" && (
          <BaseScrollArea.Corner
            data-slot="scroll-area-corner"
            className="bg-transparent"
          />
        )}
      </BaseScrollArea.Root>
    );
  }
);

export interface ScrollBarProps
  extends React.ComponentPropsWithoutRef<typeof BaseScrollArea.Scrollbar> {
  orientation?: "vertical" | "horizontal";
}

export const ScrollBar = React.forwardRef<HTMLDivElement, ScrollBarProps>(
  function ScrollBar(
    { orientation = "vertical", className, ...otherProps },
    forwardedRef
  ) {
    return (
      <BaseScrollArea.Scrollbar
        ref={forwardedRef}
        orientation={orientation}
        keepMounted={false}
        data-slot="scroll-area-scrollbar"
        className={cn(scrollbarVariants({ orientation }), className)}
        {...otherProps}
      >
        <BaseScrollArea.Thumb
          data-slot="scroll-area-thumb"
          className={thumbVariants({ orientation })}
        />
      </BaseScrollArea.Scrollbar>
    );
  }
);
