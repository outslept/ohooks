"use client";

import * as React from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { useControllableState } from "@/hooks/useControllableState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "cn";

type ControlMode = "controlled" | "uncontrolled";

const MODES: { value: ControlMode; label: string }[] = [
  { value: "controlled", label: "Controlled" },
  { value: "uncontrolled", label: "Uncontrolled" },
];

function ControllableCounter({
  value,
  defaultValue,
  onChange,
}: {
  value?: number;
  defaultValue: number;
  onChange?: (next: number) => void;
}) {
  const [count, setCount, isControlled] = useControllableState<number>({
    value,
    defaultValue,
    onChange,
  });

  return (
    <div className="relative flex h-24 w-full flex-col items-center justify-center gap-2 rounded-md border border-border-subtle bg-subtle/35 px-4">
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-1.5 left-1.5 size-2 border-t-[1.5px] border-l-[1.5px] border-foreground transition-opacity duration-200",
          isControlled ? "opacity-85" : "opacity-30"
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-1.5 right-1.5 size-2 border-t-[1.5px] border-r-[1.5px] border-foreground transition-opacity duration-200",
          isControlled ? "opacity-85" : "opacity-30"
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "absolute bottom-1.5 left-1.5 size-2 border-b-[1.5px] border-l-[1.5px] border-foreground transition-opacity duration-200",
          isControlled ? "opacity-85" : "opacity-30"
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "absolute right-1.5 bottom-1.5 size-2 border-r-[1.5px] border-b-[1.5px] border-foreground transition-opacity duration-200",
          isControlled ? "opacity-85" : "opacity-30"
        )}
      />

      <div className="flex items-center gap-4 font-mono tabular-nums">
        <Button
          size="icon-compact"
          variant="secondary"
          onClick={() => setCount((c) => c - 1)}
          aria-label="Decrement child state"
        >
          <Minus />
        </Button>

        <span className="min-w-[3ch] text-center text-2xl font-semibold tracking-tight text-foreground">
          {count}
        </span>

        <Button
          size="icon-compact"
          variant="secondary"
          onClick={() => setCount((c) => c + 1)}
          aria-label="Increment child state"
        >
          <Plus />
        </Button>
      </div>

      <Badge
        size="compact"
        variant={isControlled ? "code" : "secondary"}
        className="font-mono"
      >
        isControlled: {String(isControlled)}
      </Badge>
    </div>
  );
}

export function UseControllableStateDemo() {
  const [mode, setMode] = React.useState<ControlMode>("controlled");
  const [parentValue, setParentValue] = React.useState(10);

  const isControlledMode = mode === "controlled";

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between">

          <div
            role="group"
            aria-label="Control mode"
            className="inline-flex items-center gap-0.5 rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {MODES.map((option) => {
              const selected = mode === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMode(option.value)}
                  className={cn(
                    "rounded-2xs px-1.5 py-0.5 font-mono text-3xs font-medium outline-none select-none",
                    "transition-colors duration-150 ease-out",
                    selected
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground pointer-hover:hover:text-foreground",
                    "focus-visible:ring-1 focus-visible:ring-ring"
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <ControllableCounter
          key={mode}
          value={isControlledMode ? parentValue : undefined}
          defaultValue={parentValue}
          onChange={setParentValue}
        />
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col items-center py-2.5">
          <span className="text-3xs font-medium tracking-wider text-muted-foreground uppercase">
            Parent State
          </span>
          <span className="mt-0.5 font-mono text-xs font-medium text-foreground tabular-nums">
            {parentValue}
          </span>
        </div>
        <div className="flex flex-col items-center py-2.5">
          <span className="text-3xs font-medium tracking-wider text-muted-foreground uppercase">
            Prop Value
          </span>
          <span className="mt-0.5 font-mono text-xs font-medium text-foreground tabular-nums">
            {isControlledMode ? parentValue : "undefined"}
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          size="compact"
          variant="secondary"
          leadingIcon={Plus}
          onClick={() => setParentValue((v) => v + 10)}
          className="flex-1 font-mono"
        >
          Parent +10
        </Button>

        <Button
          size="compact"
          variant="secondary"
          leadingIcon={RotateCcw}
          onClick={() => setParentValue(10)}
          aria-label="Reset parent state"
        >
          Reset
        </Button>
      </CardFooter>
    </Card>
  );
}

export default UseControllableStateDemo;
