"use client";

import * as React from "react";
import { cn } from "cn";
import { useSize, type SizeStep } from "@/context/size-context";

export type IconComponent = React.ComponentType<{ className?: string }>;

interface InputGroupContextValue {
  size: SizeStep;
  hoveredKey: string | null;
  onFieldPointerEnter: (key: string, el: HTMLElement) => void;
}

const InputGroupContext = React.createContext<InputGroupContextValue | null>(null);

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: SizeStep;
}

interface HighlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(function InputGroup(
  { children, size: sizeProp, className, onPointerLeave, ...props },
  forwardedRef,
) {
  const { size } = useSize(sizeProp);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [hoveredKey, setHoveredKey] = React.useState<string | null>(null);
  const [rect, setRect] = React.useState<HighlightRect | null>(null);
  const [shouldAnimate, setShouldAnimate] = React.useState(false);
  const isInsideRef = React.useRef(false);

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef],
  );

  const onFieldPointerEnter = React.useCallback((key: string, fieldEl: HTMLElement) => {
    if (
      typeof window !== "undefined" &&
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }
    const container = containerRef.current;
    if (!container) return;

    const containerBox = container.getBoundingClientRect();
    const fieldBox = fieldEl.getBoundingClientRect();

    setRect({
      x: fieldBox.left - containerBox.left,
      y: fieldBox.top - containerBox.top,
      width: fieldBox.width,
      height: fieldBox.height,
    });

    if (!isInsideRef.current) {
      isInsideRef.current = true;
      setShouldAnimate(false);
    } else {
      setShouldAnimate(true);
    }
    setHoveredKey(key);
  }, []);

  const handlePointerLeave = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      isInsideRef.current = false;
      setHoveredKey(null);
      onPointerLeave?.(e);
    },
    [onPointerLeave],
  );

  const contextValue = React.useMemo<InputGroupContextValue>(
    () => ({
      size,
      hoveredKey,
      onFieldPointerEnter,
    }),
    [size, hoveredKey, onFieldPointerEnter],
  );

  return (
    <InputGroupContext.Provider value={contextValue}>
      <div
        ref={setRefs}
        data-slot="input-group"
        data-size={size}
        onPointerLeave={handlePointerLeave}
        className={cn(
          "relative isolate flex w-full flex-col",
          size === "compact" ? "gap-1.5" : "gap-2",
          className,
        )}
        {...props}
      >
        {rect && (
          <div
            aria-hidden="true"
            style={{
              transform: `translate3d(${rect.x}px, ${rect.y}px, 0)`,
              width: rect.width,
              height: rect.height,
            }}
            className={cn(
              "pointer-events-none absolute top-0 left-0 z-0 rounded-xl bg-fluid-hover",
              hoveredKey ? "opacity-100" : "opacity-0",
              shouldAnimate
                ? "transition-[transform,width,height,opacity] duration-200 ease-out"
                : "transition-opacity duration-150 ease-out",
              "motion-reduce:transition-opacity",
            )}
          />
        )}

        {children}
      </div>
    </InputGroupContext.Provider>
  );
});

export interface InputFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "size"
> {
  label?: string;
  labelHidden?: boolean;
  index?: number;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  icon?: IconComponent;
  error?: string;
  disabled?: boolean;
  size?: SizeStep;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(function InputField(
  {
    label,
    labelHidden = false,
    index,
    value,
    onChange,
    placeholder,
    icon: Icon,
    error,
    disabled = false,
    size: sizeProp,
    className,
    id: idProp,
    ...inputProps
  },
  forwardedRef,
) {
  const autoId = React.useId();
  const id = idProp ?? autoId;
  const errorId = `${id}-error`;
  const group = React.useContext(InputGroupContext);
  const { size } = useSize(sizeProp ?? group?.size);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const fieldKey = index !== undefined ? String(index) : autoId;

  const hasError = Boolean(error);

  return (
    <div
      ref={wrapperRef}
      data-slot="input-field"
      data-index={index}
      data-size={size}
      data-invalid={hasError ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      onPointerEnter={() => {
        if (!disabled && wrapperRef.current && group) {
          group.onFieldPointerEnter(fieldKey, wrapperRef.current);
        }
      }}
      className={cn(
        "relative z-10 flex flex-col rounded-xl transition-opacity duration-150 ease-out",
        size === "compact" ? "gap-1 p-1.5" : "gap-1.5 p-2",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "font-medium text-foreground/85 select-none",
            size === "compact" ? "text-xs" : "text-ui",
            labelHidden && "sr-only",
          )}
        >
          {label}
        </label>
      )}

      <div
        className={cn(
          "relative inline-flex w-full items-center bg-control text-foreground shadow-control",
          "border border-border",
          "transition-[border-color,box-shadow,background-color] duration-150 ease-out",
          "pointer-hover:hover:border-border-hover",
          hasError && "border-destructive/80",
          "focus-within:border-border-focus focus-within:ring-2 focus-within:ring-ring",
          size === "compact"
            ? "h-7 gap-1.5 rounded-md px-2.5 text-base pointer-hover:text-xs"
            : "h-9 gap-2 rounded-lg px-3 text-base pointer-hover:text-ui",
        )}
      >
        {Icon && (
          <Icon
            aria-hidden="true"
            className={cn(
              "shrink-0 text-muted-foreground/75",
              size === "compact" ? "size-3.5" : "size-4",
            )}
          />
        )}
        <input
          ref={forwardedRef}
          id={id}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : undefined}
          onChange={(e) => onChange?.(e.target.value)}
          className="h-full w-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground/70"
          {...inputProps}
        />
      </div>

      {hasError && (
        <p
          id={errorId}
          role="alert"
          className={cn("text-destructive", size === "compact" ? "text-2xs" : "text-xs")}
        >
          {error}
        </p>
      )}
    </div>
  );
});
