"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { useSize, type SizeStep } from "@/context/size-context";
import { cn } from "cn";

const badgeVariants = cva(
  [
    "inline-flex w-fit shrink-0 items-center justify-center whitespace-nowrap rounded-md font-medium select-none",
    "transition-[background-color,color,border-color,box-shadow] duration-150 ease-snappy",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-control",
        secondary:
          "bg-muted/80 text-foreground/85 ring-1 ring-inset ring-outline-inset",
        outline:
          "bg-transparent text-foreground ring-1 ring-inset ring-border",
        code: "font-mono bg-subtle text-foreground/90 ring-1 ring-inset ring-outline-inset",
        accent:
          "font-mono bg-primary/10 text-primary ring-1 ring-inset ring-primary/20",
        destructive:
          "bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/20",
        warning:
          "bg-warning/10 text-warning ring-1 ring-inset ring-warning/25",
      },
      size: {
        default:
          "h-5 gap-1 px-1.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        compact:
          "h-4.5 gap-1 px-1.25 text-2xs [&_svg:not([class*='size-'])]:size-2.5",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.ComponentPropsWithoutRef<"span">,
    VariantProps<typeof badgeVariants> {
  size?: SizeStep;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size: sizeProp, ...props }, forwardedRef) => {
    const { size } = useSize(sizeProp);

    return (
      <span
        ref={forwardedRef}
        data-slot="badge"
        data-variant={variant}
        data-size={size}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
