"use client";

import * as React from "react";
import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import { cva } from "class-variance-authority";
import { ChevronRight } from "lucide-react";
import { cn } from "cn";
import { useSize, type SizeStep } from "@/context/size-context";
import Image from "next/image";

export type IconComponent = React.ComponentType<{ className?: string }>;

export type StepStatus = "complete" | "active" | "pending";

interface StepsContextValue {
  size: SizeStep;
  open: boolean;
}

const StepsContext = React.createContext<StepsContextValue>({
  size: "default",
  open: true,
});

function useStepsContext() {
  return React.useContext(StepsContext);
}

function isComponentType(icon: unknown): icon is IconComponent {
  if (typeof icon === "function") return true;
  if (typeof icon === "object" && icon !== null && "$$typeof" in icon) {
    const typeofSymbol = (icon as { $$typeof?: symbol }).$$typeof;
    return (
      typeofSymbol === Symbol.for("react.forward_ref") || typeofSymbol === Symbol.for("react.memo")
    );
  }
  return false;
}

function renderStepIcon(
  icon: IconComponent | React.ReactNode | undefined,
  showIcon: boolean,
  status: StepStatus,
  size: SizeStep,
): React.ReactNode {
  if (!showIcon || !icon) {
    return (
      <span
        className={cn(
          "rounded-full transition-[transform,background-color] duration-200 ease-out",
          size === "compact" ? "size-1.5" : "size-2",
          status === "active" ? "scale-110 bg-foreground" : "bg-muted-foreground/75",
        )}
      />
    );
  }

  const iconSizeClass = size === "compact" ? "size-3.5" : "size-4";

  if (isComponentType(icon)) {
    const Icon = icon;
    return <Icon className={cn("shrink-0", iconSizeClass)} />;
  }

  return icon;
}

export interface StepsProps {
  size?: SizeStep;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  children: React.ReactNode;
}

export const Steps = React.forwardRef<HTMLDivElement, StepsProps>(function Steps(
  { size: sizeProp, defaultOpen = true, open: controlledOpen, onOpenChange, className, children },
  forwardedRef,
) {
  const { size } = useSize(sizeProp);
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isOpen = controlledOpen ?? uncontrolledOpen;

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [controlledOpen, onOpenChange],
  );

  const ctx = React.useMemo<StepsContextValue>(() => ({ size, open: isOpen }), [size, isOpen]);

  const childArray = React.Children.toArray(children);
  let headerNode: React.ReactNode = null;
  const stepNodes: React.ReactNode[] = [];

  for (const child of childArray) {
    if (React.isValidElement(child) && child.type === StepsHeader && !headerNode) {
      headerNode = child;
      continue;
    }
    stepNodes.push(child);
  }

  let lastVisibleIndex = -1;
  stepNodes.forEach((node, idx) => {
    if (React.isValidElement<StepProps>(node) && node.props.status !== "pending") {
      lastVisibleIndex = idx;
    }
  });

  const enhancedSteps = stepNodes.map((node, idx) => {
    if (!React.isValidElement<StepProps>(node) || node.type !== Step) {
      return node;
    }
    if (node.props.isLast === undefined && idx === lastVisibleIndex) {
      return React.cloneElement(node, { isLast: true });
    }
    return node;
  });

  return (
    <StepsContext.Provider value={ctx}>
      <BaseCollapsible.Root
        ref={forwardedRef}
        open={isOpen}
        onOpenChange={handleOpenChange}
        data-slot="steps"
        data-size={size}
        className={cn("flex w-full flex-col", className)}
      >
        {headerNode}

        {headerNode ? (
          <BaseCollapsible.Panel
            keepMounted
            data-slot="steps-panel"
            className={cn(
              "overflow-hidden transition-[height,opacity] duration-220 ease-out",
              "h-[var(--collapsible-panel-height)] opacity-100",
              "data-[starting-style]:h-0 data-[starting-style]:opacity-0",
              "data-[ending-style]:h-0 data-[ending-style]:opacity-0",
              "motion-reduce:transition-none",
            )}
          >
            <div className={cn("flex flex-col", size === "compact" ? "pt-1.5" : "pt-2")}>
              {enhancedSteps}
            </div>
          </BaseCollapsible.Panel>
        ) : (
          <div className="flex flex-col">{enhancedSteps}</div>
        )}
      </BaseCollapsible.Root>
    </StepsContext.Provider>
  );
});

export interface StepsHeaderProps extends React.ComponentPropsWithoutRef<
  typeof BaseCollapsible.Trigger
> {
  children?: React.ReactNode;
}

export const StepsHeader = React.forwardRef<HTMLButtonElement, StepsHeaderProps>(
  function StepsHeader({ children = "Thinking", className, ...props }, ref) {
    const { size } = useStepsContext();

    return (
      <BaseCollapsible.Trigger
        ref={ref}
        data-slot="steps-header"
        className={cn(
          "group/steps-header inline-flex w-fit items-center select-none rounded-md font-medium text-muted-foreground outline-none",
          "transition-[color,transform,opacity] duration-150 ease-out",
          "pointer-hover:hover:text-foreground",
          "active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100",
          "focus-visible:ring-2 focus-visible:ring-ring",
          size === "compact" ? "gap-1 text-xs" : "gap-1.5 text-ui",
          className,
        )}
        {...props}
      >
        <span>{children}</span>
        <ChevronRight
          aria-hidden="true"
          className={cn(
            "shrink-0 text-muted-foreground/75 transition-transform duration-200 ease-out",
            "group-data-[panel-open]/steps-header:rotate-90",
            size === "compact" ? "size-3.5" : "size-4",
          )}
        />
      </BaseCollapsible.Trigger>
    );
  },
);

export interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: IconComponent | React.ReactNode;
  showIcon?: boolean;
  label: React.ReactNode;
  description?: React.ReactNode;
  status?: StepStatus;
  delay?: number;
  isLast?: boolean;
}

export const Step = React.forwardRef<HTMLDivElement, StepProps>(function Step(
  {
    icon,
    showIcon = true,
    label,
    description,
    status = "complete",
    delay = 0.08,
    isLast = false,
    className,
    children,
    ...props
  },
  forwardedRef,
) {
  const { size } = useStepsContext();
  const isPending = status === "pending";
  const isActive = status === "active";

  const childArray = React.Children.toArray(children);
  const sourceNodes: React.ReactNode[] = [];
  const otherNodes: React.ReactNode[] = [];

  for (const child of childArray) {
    if (React.isValidElement(child) && child.type === StepSource) {
      sourceNodes.push(child);
    } else {
      otherNodes.push(child);
    }
  }

  return (
    <div
      ref={forwardedRef}
      data-slot="step"
      data-status={status}
      aria-hidden={isPending || undefined}
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-220 ease-out motion-reduce:transition-none",
        isPending
          ? "pointer-events-none grid-rows-[0fr] opacity-0"
          : "grid-rows-[1fr] opacity-100 [@starting-style]:grid-rows-[0fr] [@starting-style]:opacity-0",
        className,
      )}
      {...props}
    >
      <div className="overflow-hidden">
        <div
          className={cn("relative flex items-stretch", size === "compact" ? "gap-2" : "gap-2.5")}
        >
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex shrink-0 items-center justify-center text-muted-foreground [&_svg]:shrink-0",
                size === "compact"
                  ? "h-[18px] w-4 [&_svg]:size-3.5"
                  : "h-[20px] w-4 [&_svg]:size-4",
              )}
            >
              {renderStepIcon(icon, showIcon, status, size)}
            </div>

            {!isLast && (
              <div
                className={cn(
                  "w-px flex-1 bg-border transition-opacity duration-200 ease-out",
                  size === "compact" ? "my-0.5" : "my-1",
                )}
              />
            )}
          </div>

          <div
            style={{
              transitionDelay: isPending ? "0s" : `${delay}s`,
            }}
            className={cn(
              "flex min-w-0 flex-1 flex-col",
              "transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
              isPending
                ? "translate-y-1 opacity-0"
                : "translate-y-0 opacity-100 [@starting-style]:translate-y-1 [@starting-style]:opacity-0",
              !isLast && (size === "compact" ? "pb-2.5" : "pb-3.5"),
              size === "compact" ? "gap-1" : "gap-1.5",
            )}
          >
            <div
              className={cn(
                "font-normal text-foreground/90",
                size === "compact" ? "text-xs" : "text-ui",
              )}
            >
              <span
                className={cn(
                  isActive && [
                    "inline-block bg-[length:220%_100%] bg-clip-text text-transparent",
                    "bg-[linear-gradient(110deg,#52525b_35%,#18181b_50%,#52525b_65%)]",
                    "dark:bg-[linear-gradient(110deg,#a1a1aa_35%,#ffffff_50%,#a1a1aa_65%)]",
                    "animate-shimmer motion-reduce:animate-none",
                  ],
                )}
              >
                {label}
              </span>
            </div>

            {description && (
              <div
                className={cn("text-muted-foreground", size === "compact" ? "text-2xs" : "text-xs")}
              >
                {description}
              </div>
            )}

            {sourceNodes.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">{sourceNodes}</div>
            )}

            {otherNodes.length > 0 && (
              <div className="flex flex-col gap-1.5 pt-0.5">{otherNodes}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export interface StepDetailsProps {
  summary: React.ReactNode;
  details?: string[];
  defaultOpen?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const StepDetails = React.forwardRef<HTMLDivElement, StepDetailsProps>(function StepDetails(
  { summary, details, defaultOpen = false, children, className },
  ref,
) {
  const { size } = useStepsContext();

  return (
    <BaseCollapsible.Root
      ref={ref}
      defaultOpen={defaultOpen}
      data-slot="step-details"
      className={cn("flex flex-col", className)}
    >
      <BaseCollapsible.Trigger
        className={cn(
          "group/step-details inline-flex w-fit items-center gap-1 rounded-xs text-muted-foreground select-none outline-none",
          "transition-[color,transform] duration-150 ease-out",
          "pointer-hover:hover:text-foreground",
          "active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring",
          size === "compact" ? "text-2xs" : "text-xs",
        )}
      >
        <span>{summary}</span>
        <ChevronRight
          aria-hidden="true"
          className="size-3 shrink-0 transition-transform duration-180 ease-out group-data-[panel-open]/step-details:rotate-90"
        />
      </BaseCollapsible.Trigger>

      <BaseCollapsible.Panel
        keepMounted
        className={cn(
          "overflow-hidden transition-[height,opacity] duration-180 ease-out",
          "h-[var(--collapsible-panel-height)] opacity-100",
          "data-[starting-style]:h-0 data-[starting-style]:opacity-0",
          "data-[ending-style]:h-0 data-[ending-style]:opacity-0",
          "motion-reduce:transition-none",
        )}
      >
        <div
          className={cn(
            "mt-1.5 flex flex-col gap-1 rounded-lg border border-border-subtle bg-muted/50 px-2.5 py-2 text-muted-foreground",
            size === "compact" ? "text-2xs" : "text-xs",
          )}
        >
          {details && details.length > 0
            ? details.map((line, i) => (
                <div key={i} className="truncate font-mono text-2xs">
                  {line}
                </div>
              ))
            : children}
        </div>
      </BaseCollapsible.Panel>
    </BaseCollapsible.Root>
  );
});

const stepSourceVariants = cva(
  [
    "inline-flex items-center gap-1 rounded-md font-medium select-none",
    "bg-secondary text-secondary-foreground ring-1 ring-inset ring-border-subtle",
    "transition-[opacity,transform] duration-180 ease-out",
    "[@starting-style]:scale-95 [@starting-style]:opacity-0",
    "motion-reduce:transition-none",
  ],
  {
    variants: {
      size: {
        default: "h-5 px-1.5 text-2xs",
        compact: "h-4.5 px-1.5 text-3xs",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export interface StepSourceProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: string;
  delay?: number;
  children: React.ReactNode;
}

export const StepSource = React.forwardRef<HTMLSpanElement, StepSourceProps>(function StepSource(
  { color, delay = 0, className, style, children, ...props },
  ref,
) {
  const { size } = useStepsContext();

  return (
    <span
      ref={ref}
      data-slot="step-source"
      style={{
        ...style,
        transitionDelay: delay ? `${delay}s` : undefined,
        ...(color
          ? {
              backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)`,
              color: `color-mix(in oklab, ${color} 80%, var(--foreground))`,
              boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${color} 28%, transparent)`,
            }
          : undefined),
      }}
      className={cn(stepSourceVariants({ size }), className)}
      {...props}
    >
      {children}
    </span>
  );
});

export interface StepImageProps extends React.HTMLAttributes<HTMLElement> {
  src: string;
  alt?: string;
  caption?: string;
  delay?: number;
}

export const StepImage = React.forwardRef<HTMLElement, StepImageProps>(function StepImage(
  { src, alt = "", caption, delay = 0, className, style, ...props },
  ref,
) {
  const { size } = useStepsContext();

  return (
    <figure
      ref={ref}
      data-slot="step-image"
      style={{
        ...style,
        transitionDelay: delay ? `${delay}s` : undefined,
      }}
      className={cn(
        "flex flex-col gap-1",
        "transition-[opacity,transform] duration-200 ease-out",
        "[@starting-style]:scale-95 [@starting-style]:opacity-0",
        "motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "relative w-fit max-w-xs overflow-hidden rounded-lg bg-muted",
          "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-outline-inset",
        )}
      >
        <Image src={src} alt={alt} className="max-h-44 w-auto object-cover" />
      </div>

      {caption && (
        <figcaption
          className={cn(
            "text-muted-foreground",
            size === "compact" ? "text-2xs/[15px]" : "text-xs/4",
          )}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
});
