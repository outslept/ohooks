"use client";

import * as React from "react";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { cva } from "class-variance-authority";
import {cn} from 'cn';
import { SizeStep, useSize } from "@/context/size-context";

const checkboxVariants = cva(
  [
    "group/checkbox relative inline-flex shrink-0 items-center justify-center select-none outline-none",
    "border border-border-hover bg-control shadow-control",
    "transition-[transform,background-color,border-color,box-shadow,opacity] duration-150 ease-out",
    "enabled:active:scale-[0.92] motion-reduce:transition-none motion-reduce:active:scale-100",
    "pointer-hover:data-[unchecked]:hover:border-foreground/40",
    "aria-invalid:data-[unchecked]:border-destructive/85",
    "data-[checked]:border-primary data-[checked]:bg-primary data-[checked]:text-primary-foreground",
    "data-[indeterminate]:border-primary data-[indeterminate]:bg-primary data-[indeterminate]:text-primary-foreground",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  ],
  {
    variants: {
      size: {
        default: "size-4 rounded-xs",
        compact: "size-3.5 rounded-2xs",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface CheckboxProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof BaseCheckbox.Root>,
    "onCheckedChange"
  > {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  size?: SizeStep;
}

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  function Checkbox(
    {
      checked,
      defaultChecked = false,
      indeterminate = false,
      onCheckedChange,
      size: sizeProp,
      disabled = false,
      className,
      ...props
    },
    forwardedRef
  ) {
    const { size } = useSize(sizeProp);

    return (
      <BaseCheckbox.Root
        ref={forwardedRef}
        checked={checked}
        defaultChecked={defaultChecked}
        indeterminate={indeterminate}
        disabled={disabled}
        onCheckedChange={(nextChecked) => {
          onCheckedChange?.(nextChecked);
        }}
        data-slot="checkbox"
        data-size={size}
        className={cn(checkboxVariants({ size }), className)}
        {...props}
      >
        <BaseCheckbox.Indicator
          keepMounted
          className="pointer-events-none flex size-full items-center justify-center"
        >
          {indeterminate ? (
            <svg
              aria-hidden="true"
              viewBox="0 0 14 14"
              fill="none"
              className={cn(
                "size-3 transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none",
                "scale-100 opacity-100"
              )}
            >
              <path
                d="M3.5 7H10.5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg
              aria-hidden="true"
              viewBox="0 0 14 14"
              fill="none"
              className="size-3"
            >
              <path
                d="M3 7.25L5.75 10L11 4"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                className={cn(
                  "[stroke-dasharray:1] [stroke-dashoffset:1] opacity-0",
                  "transition-[stroke-dashoffset,opacity] duration-160 ease-out motion-reduce:transition-none",
                  "group-data-checked/checkbox:[stroke-dashoffset:0] group-data-checked/checkbox:opacity-100"
                )}
              />
            </svg>
          )}
        </BaseCheckbox.Indicator>
      </BaseCheckbox.Root>
    );
  }
);
