"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { useSizeContext, type SizeStep } from "@/context/size-context";
import { cn } from "cn";

export const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center select-none whitespace-nowrap border font-medium outline-none",
    "transition-[transform,background-color,border-color,color,box-shadow,opacity] duration-160 ease-snappy",
    "enabled:active:scale-[0.97] data-[active]:scale-[0.97] data-[popup-open]:scale-[0.97]",
    "disabled:pointer-events-none disabled:opacity-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    "motion-reduce:transition-none motion-reduce:active:scale-100 motion-reduce:data-[active]:scale-100 motion-reduce:data-[popup-open]:scale-100",
  ],
  {
    variants: {
      variant: {
        primary: [
          "border-transparent bg-primary text-primary-foreground shadow-xs",
          "pointer-hover:hover:bg-[color-mix(in_oklab,var(--color-primary)_88%,var(--color-primary-foreground))]",
          "enabled:active:bg-[color-mix(in_oklab,var(--color-primary)_80%,var(--color-primary-foreground))]",
          "data-[active]:bg-[color-mix(in_oklab,var(--color-primary)_80%,var(--color-primary-foreground))]",
          "data-[popup-open]:bg-[color-mix(in_oklab,var(--color-primary)_80%,var(--color-primary-foreground))]",
          "focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        ],
        secondary: [
          "border-border bg-control text-foreground shadow-control",
          "pointer-hover:hover:border-border-hover pointer-hover:hover:bg-[color-mix(in_oklab,var(--color-control)_65%,var(--color-muted))] dark:pointer-hover:hover:bg-accent",
          "enabled:active:border-border-hover enabled:active:bg-muted",
          "data-[active]:border-border-hover data-[active]:bg-muted",
          "data-[popup-open]:border-border-hover data-[popup-open]:bg-muted",
          "focus-visible:border-border-focus focus-visible:ring-2 focus-visible:ring-ring",
        ],
        tertiary: [
          "border-transparent bg-secondary text-secondary-foreground dark:bg-muted",
          "pointer-hover:hover:bg-accent pointer-hover:hover:text-accent-foreground dark:pointer-hover:hover:bg-secondary",
          "enabled:active:bg-[color-mix(in_oklab,var(--color-accent)_92%,var(--color-foreground))] enabled:active:text-foreground dark:enabled:active:bg-accent",
          "data-[active]:bg-[color-mix(in_oklab,var(--color-accent)_92%,var(--color-foreground))] data-[active]:text-foreground dark:data-[active]:bg-accent",
          "data-[popup-open]:bg-[color-mix(in_oklab,var(--color-accent)_92%,var(--color-foreground))] data-[popup-open]:text-foreground dark:data-[popup-open]:bg-accent",
          "focus-visible:border-border-focus focus-visible:ring-2 focus-visible:ring-ring",
        ],
        ghost: [
          "border-transparent bg-transparent text-muted-foreground",
          "pointer-hover:hover:bg-fluid-hover pointer-hover:hover:text-foreground",
          "enabled:active:bg-fluid-selected enabled:active:text-foreground",
          "data-[active]:bg-fluid-selected data-[active]:text-foreground",
          "data-[popup-open]:bg-fluid-selected data-[popup-open]:text-foreground",
          "focus-visible:border-border-focus focus-visible:ring-2 focus-visible:ring-ring",
        ],
        destructive: [
          "border-destructive/30 bg-destructive/10 text-[color-mix(in_oklab,var(--color-destructive)_82%,var(--color-foreground))] shadow-2xs dark:border-destructive/35 dark:bg-destructive/12",
          "pointer-hover:hover:border-destructive/50 pointer-hover:hover:bg-destructive/16 dark:pointer-hover:hover:border-destructive/55 dark:pointer-hover:hover:bg-destructive/20",
          "enabled:active:border-destructive/65 enabled:active:bg-destructive/22 dark:enabled:active:border-destructive/70 dark:enabled:active:bg-destructive/28",
          "data-[active]:border-destructive/65 data-[active]:bg-destructive/22 dark:data-[active]:border-destructive/70 dark:data-[active]:bg-destructive/28",
          "data-[popup-open]:border-destructive/65 data-[popup-open]:bg-destructive/22 dark:data-[popup-open]:border-destructive/70 dark:data-[popup-open]:bg-destructive/28",
          "focus-visible:border-destructive focus-visible:ring-2 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/25",
        ],
      },
      size: {
        default:
          "h-9 rounded-lg px-3 gap-2 text-[length:var(--text-ui)] leading-[var(--text-ui--line-height)] [&_svg]:size-4 [&_svg]:shrink-0",
        compact:
          "h-7 rounded-md px-2.5 gap-1 text-xs [&_svg]:size-3.5 [&_svg]:shrink-0",
        icon: "size-9 rounded-lg p-0 [&_svg]:size-4 [&_svg]:shrink-0",
        "icon-compact":
          "size-7 rounded-md p-0 [&_svg]:size-3.5 [&_svg]:shrink-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export type ButtonSize = "default" | "compact" | "icon" | "icon-compact";
export type LegacyButtonSize = "sm" | "md" | "lg";

export type IconComponent = React.ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;
export type IconProp = IconComponent | React.ReactNode;

function renderIconSlot(icon: IconProp | undefined) {
  if (!icon) return null;
  if (React.isValidElement(icon)) {
    return React.cloneElement(
      icon as React.ReactElement<{ "aria-hidden"?: boolean | "true" | "false" }>,
      { "aria-hidden": true }
    );
  }
  if (
    typeof icon === "function" ||
    (typeof icon === "object" && icon !== null && "$$typeof" in icon)
  ) {
    const Icon = icon as IconComponent;
    return <Icon aria-hidden="true" />;
  }
  return icon;
}

function resolveButtonSize(
  sizeProp: ButtonSize | LegacyButtonSize | undefined,
  providerSize: SizeStep
): ButtonSize {
  if (!sizeProp) return providerSize;
  switch (sizeProp) {
    case "sm":
      return "compact";
    case "md":
    case "lg":
      return "default";
    default:
      return sizeProp;
  }
}

export interface ButtonProps
  extends Omit<useRender.ComponentProps<"button">, "disabled" | "size">,
    Omit<VariantProps<typeof buttonVariants>, "size"> {
  size?: ButtonSize | LegacyButtonSize;
  loading?: boolean;
  active?: boolean;
  leadingIcon?: IconProp;
  trailingIcon?: IconProp;
  asChild?: boolean;
  disabled?: boolean;
}

export const Button = React.forwardRef<HTMLElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size: sizeProp,
      loading = false,
      active = false,
      leadingIcon,
      trailingIcon,
      asChild = false,
      render,
      disabled = false,
      className,
      children,
      type = "button",
      ...otherProps
    },
    forwardedRef
  ) {
    const { size: providerSize } = useSizeContext();
    const resolvedSize = resolveButtonSize(sizeProp, providerSize);
    const isDisabled = disabled || loading;

    const resolvedRender =
      render ??
      (asChild && React.isValidElement(children)
        ? (children as React.ReactElement)
        : undefined);

    const rawChildren =
      asChild && !render && React.isValidElement(children)
        ? (children.props as { children?: React.ReactNode }).children
        : children;

    const content = (
      <>
        <span
          className={cn(
            "inline-flex items-center justify-center gap-[inherit]",
            "transition-[opacity,filter,transform] duration-180 ease-snappy motion-reduce:transition-none",
            loading
              ? "scale-95 opacity-0 blur-xs"
              : "scale-100 opacity-100 blur-0"
          )}
        >
          {renderIconSlot(leadingIcon)}
          {rawChildren}
          {renderIconSlot(trailingIcon)}
        </span>

        <span
          aria-hidden={!loading}
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center justify-center",
            "transition-[opacity,filter,transform] duration-180 ease-snappy motion-reduce:transition-none",
            loading
              ? "scale-100 opacity-100 blur-0"
              : "scale-95 opacity-0 blur-xs"
          )}
        >
          <svg
            className={cn(loading && "animate-spinner")}
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-90"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </span>
      </>
    );

    const defaultProps: useRender.ElementProps<"button"> &
      Record<`data-${string}`, string | undefined> = {
      type: resolvedRender ? undefined : type,
      className: cn(buttonVariants({ variant, size: resolvedSize }), className),
      disabled: isDisabled,
      "aria-busy": loading || undefined,
      "data-slot": "button",
      "data-variant": variant ?? "primary",
      "data-size": resolvedSize,
      "data-loading": loading ? "" : undefined,
      "data-active": active ? "" : undefined,
      "data-disabled": isDisabled ? "" : undefined,
      children: content,
    };

    return useRender({
      defaultTagName: "button",
      render: resolvedRender,
      ref: forwardedRef,
      props: mergeProps<"button">(defaultProps, otherProps),
    });
  }
);
