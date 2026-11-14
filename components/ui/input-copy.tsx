"use client";

import * as React from "react";
import {cn} from "cn";
import { useSize, type SizeStep } from "@/context/size-context";

export interface InputCopyProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onCopy"> {
  value: string;
  label?: string;
  variant?: "icon" | "button";
  align?: "right" | "left";
  onCopy?: () => void;
  disabled?: boolean;
  size?: SizeStep;
  children?: React.ReactNode;
}

export const InputCopy = React.forwardRef<HTMLDivElement, InputCopyProps>(
  function InputCopy(
    {
      value,
      label,
      variant = "icon",
      align = "right",
      onCopy,
      disabled = false,
      size: sizeProp,
      className,
      children,
      ...props
    },
    forwardedRef
  ) {
    const { size } = useSize(sizeProp);
    const id = React.useId();
    const [copied, setCopied] = React.useState(false);
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }, []);

    const handleCopy = React.useCallback(async () => {
      if (disabled) return;
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        onCopy?.();
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setCopied(false);
        }, 1800);
      } catch {
      }
    }, [disabled, value, onCopy]);

    const iconSizeClass = size === "compact" ? "size-3.5" : "size-4";

    const copyIcons = (
      <span
        className={cn(
          "relative inline-flex items-center justify-center",
          iconSizeClass
        )}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          className={cn(
            "absolute inset-0 transition-[opacity,transform,filter] duration-180 ease-out motion-reduce:transition-none",
            copied
              ? "scale-95 opacity-0 blur-xs"
              : "scale-100 opacity-100 blur-0"
          )}
        >
          <rect
            x="5.5"
            y="5.5"
            width="8"
            height="8"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path
            d="M3.5 10.5H3C2.44772 10.5 2 10.0523 2 9.5V3C2 2.44772 2.44772 2 3 2H9.5C10.0523 2 10.5 2.44772 10.5 3V3.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>

        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          className={cn(
            "absolute inset-0 text-success transition-[opacity,transform,filter] duration-180 ease-out motion-reduce:transition-none",
            copied
              ? "scale-100 opacity-100 blur-0"
              : "scale-95 opacity-0 blur-xs"
          )}
        >
          <path
            d="M3.5 8.5L6.5 11.5L12.5 4.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );

    const copyButton = (
      <button
        type="button"
        disabled={disabled}
        onClick={handleCopy}
        aria-label={copied ? "Copied" : "Copy to clipboard"}
        className={cn(
          "group/copy-btn relative inline-flex shrink-0 items-center justify-center select-none font-medium outline-none",
          "transition-[transform,background-color,color,opacity] duration-160 ease-out",
          "enabled:active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100",
          "focus-visible:ring-2 focus-visible:ring-ring",
          variant === "icon"
            ? [
                "rounded-md text-muted-foreground",
                "pointer-hover:hover:bg-accent pointer-hover:hover:text-foreground",
                size === "compact" ? "size-5" : "size-7",
              ]
            : [
                "rounded-md bg-secondary text-secondary-foreground",
                "pointer-hover:hover:bg-accent pointer-hover:hover:text-accent-foreground",
                size === "compact"
                  ? "h-5 gap-1 px-2 text-2xs"
                  : "h-7 gap-1.5 px-2.5 text-xs",
              ]
        )}
      >
        {copyIcons}
        {variant === "button" && (
          <span className="relative inline-grid items-center">
            <span
              className={cn(
                "col-start-1 row-start-1 transition-[opacity,transform,filter] duration-180 ease-out",
                copied
                  ? "scale-95 opacity-0 blur-xs"
                  : "scale-100 opacity-100 blur-0"
              )}
            >
              Copy
            </span>
            <span
              className={cn(
                "col-start-1 row-start-1 transition-[opacity,transform,filter] duration-180 ease-out",
                copied
                  ? "scale-100 opacity-100 blur-0"
                  : "scale-95 opacity-0 blur-xs"
              )}
            >
              Copied
            </span>
          </span>
        )}

        {variant === "icon" && (
          <span
            role="tooltip"
            className={cn(
              "pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 origin-bottom rounded-md bg-primary px-2 py-0.5 text-2xs font-medium whitespace-nowrap text-primary-foreground shadow-sm",
              "scale-95 opacity-0 transition-[opacity,transform] duration-125 ease-out",
              "pointer-hover:group-hover/copy-btn:scale-100 pointer-hover:group-hover/copy-btn:opacity-100",
              copied && "scale-100 opacity-100"
            )}
          >
            {copied ? "Copied" : "Copy"}
          </span>
        )}
      </button>
    );

    return (
      <div
        ref={forwardedRef}
        data-slot="input-copy"
        data-size={size}
        data-disabled={disabled ? "" : undefined}
        className={cn("not-prose flex w-full flex-col gap-1.5", className)}
        {...props}
      >
        {label && (
          <label
            htmlFor={id}
            className={cn(
              "font-medium text-foreground/85 select-none",
              size === "compact" ? "text-xs" : "text-ui",
              disabled && "opacity-50"
            )}
          >
            {label}
          </label>
        )}

        <div
          className={cn(
            "relative inline-flex w-full items-center bg-control text-foreground shadow-control dark:bg-code",
            "border border-border",
            "transition-[border-color,box-shadow,opacity] duration-150 ease-out",
            "pointer-hover:hover:border-border-hover",
            "focus-within:border-border-focus focus-within:ring-2 focus-within:ring-ring",
            disabled && "pointer-events-none opacity-50",
            size === "compact"
              ? "h-7 gap-1.5 rounded-md text-base pointer-hover:text-xs"
              : "h-9 gap-2 rounded-lg text-base pointer-hover:text-ui",
            align === "left"
              ? size === "compact"
                ? "pl-1 pr-2.5"
                : "pl-1 pr-3"
              : size === "compact"
                ? "pl-2.5 pr-1"
                : "pl-3 pr-1"
          )}
        >
          {align === "left" && copyButton}

          {children ? (
            <div
              id={id}
              tabIndex={disabled ? -1 : 0}
              className={cn(
                "scroll-fade-x flex h-full w-full min-w-0 flex-1 items-center overflow-x-auto whitespace-nowrap font-mono outline-none select-all",
                "scrollbar-none [&::-webkit-scrollbar]:hidden",
                "[&_pre]:!m-0 [&_pre]:!border-0 [&_pre]:!bg-transparent [&_pre]:!p-0",
                "[&_code]:!m-0 [&_code]:!border-0 [&_code]:!bg-transparent [&_code]:!p-0 [&_code]:font-mono",
                "[&_code_span]:[color:var(--shiki-light)] dark:[&_code_span]:[color:var(--shiki-dark)]"
              )}
            >
              {children}
            </div>
          ) : (
            <input
              id={id}
              type="text"
              readOnly
              disabled={disabled}
              value={value}
              onClick={(e) => e.currentTarget.select()}
              className="h-full w-full min-w-0 flex-1 truncate bg-transparent text-foreground/85 outline-none select-all"
            />
          )}

          {align === "right" && copyButton}
        </div>
      </div>
    );
  }
);
