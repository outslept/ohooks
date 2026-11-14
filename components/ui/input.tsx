"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import {cn} from 'cn';
import { useSize, type SizeStep } from "@/context/size-context";


export const inputShellVariants = cva(
  [
    "group/input relative inline-flex w-full items-center bg-control text-foreground shadow-control outline-none",
    "border border-border",
    "transition-[border-color,box-shadow,background-color,opacity] duration-150 ease-out",
    "pointer-hover:hover:border-border-hover",
    "aria-invalid:border-destructive/80",
    "has-[input::aria-invalid]:border-destructive/80",
    "focus:border-border-focus focus:ring-2 focus:ring-ring",
    "focus-within:border-border-focus focus-within:ring-2 focus-within:ring-ring",
    "disabled:pointer-events-none disabled:opacity-50 has-[input:disabled]:pointer-events-none has-[input:disabled]:opacity-50",
    "motion-reduce:transition-none",
  ],
  {
    variants: {
      size: {
        default: "h-9 rounded-lg px-3 text-base pointer-hover:text-ui",
        compact: "h-7 rounded-md px-2.5 text-base pointer-hover:text-xs",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: SizeStep;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      size: sizeProp,
      type = "text",
      disabled = false,
      className,
      onChange,
      ...props
    },
    forwardedRef
  ) {
    const { size } = useSize(sizeProp);
    const innerRef = React.useRef<HTMLInputElement | null>(null);
    const [fileName, setFileName] = React.useState<string>("");

    const setRefs = React.useCallback(
      (node: HTMLInputElement | null) => {
        innerRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef]
    );

    if (type === "number") {
      const triggerStep = (direction: "up" | "down") => {
        const input = innerRef.current;
        if (!input || disabled) return;

        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value"
        )?.set;

        if (direction === "up") {
          input.stepUp();
        } else {
          input.stepDown();
        }

        nativeInputValueSetter?.call(input, input.value);
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      };

      return (
        <div
          data-slot="input-number"
          data-size={size}
          className={cn(inputShellVariants({ size }), "pr-1", className)}
        >
          <input
            ref={setRefs}
            type="number"
            disabled={disabled}
            onChange={onChange}
            className={cn(
              "h-full w-full min-w-0 flex-1 bg-transparent tabular-nums outline-none placeholder:text-muted-foreground/70",
              "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            )}
            {...props}
          />
          <div className="ml-1 flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              tabIndex={-1}
              disabled={disabled}
              aria-label="Decrease value"
              onClick={() => triggerStep("down")}
              className={cn(
                "inline-flex items-center justify-center rounded-xs text-muted-foreground select-none",
                "transition-[transform,background-color,color] duration-150 ease-out",
                "pointer-hover:hover:bg-accent pointer-hover:hover:text-foreground",
                "active:scale-[0.94] motion-reduce:transition-none motion-reduce:active:scale-100",
                size === "compact" ? "size-5" : "size-6"
              )}
            >
              <svg className="size-3.5" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3.5 8H12.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button
              type="button"
              tabIndex={-1}
              disabled={disabled}
              aria-label="Increase value"
              onClick={() => triggerStep("up")}
              className={cn(
                "inline-flex items-center justify-center rounded-xs text-muted-foreground select-none",
                "transition-[transform,background-color,color] duration-150 ease-out",
                "pointer-hover:hover:bg-accent pointer-hover:hover:text-foreground",
                "active:scale-[0.94] motion-reduce:transition-none motion-reduce:active:scale-100",
                size === "compact" ? "size-5" : "size-6"
              )}
            >
              <svg className="size-3.5" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 3.5V12.5M3.5 8H12.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      );
    }

    if (type === "file") {
      const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) {
          setFileName("");
        } else if (files.length === 1) {
          setFileName(files[0].name);
        } else {
          setFileName(`${files.length} files selected`);
        }
        onChange?.(e);
      };

      return (
        <label
          data-slot="input-file"
          data-size={size}
          className={cn(
            inputShellVariants({ size }),
            "cursor-pointer select-none",
            size === "compact" ? "gap-1.5" : "gap-2",
            className
          )}
        >
          <input
            ref={setRefs}
            type="file"
            disabled={disabled}
            onChange={handleFileChange}
            className="sr-only"
            {...props}
          />
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="none"
            className={cn(
              "shrink-0 text-muted-foreground/75",
              size === "compact" ? "size-3.5" : "size-4"
            )}
          >
            <path
              d="M9.5 2H4.5C3.94772 2 3.5 2.44772 3.5 3V13C3.5 13.5523 3.94772 14 4.5 14H11.5C12.0523 14 12.5 13.5523 12.5 13V5L9.5 2Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9.5 2V5H12.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            className={cn(
              "truncate",
              fileName ? "text-foreground" : "text-muted-foreground/70"
            )}
          >
            {fileName || props.placeholder || "No file chosen"}
          </span>
        </label>
      );
    }

    return (
      <input
        ref={setRefs}
        type={type}
        disabled={disabled}
        onChange={onChange}
        data-slot="input"
        data-size={size}
        className={cn(
          inputShellVariants({ size }),
          "placeholder:text-muted-foreground/70",
          className
        )}
        {...props}
      />
    );
  }
);
