"use client";

import { useState } from "react";
import { MinusIcon, PlusIcon, RotateCcwIcon } from "lucide-react";

import { useCounter } from "@/hooks/useCounter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "cn";

const MIN = 0;
const MAX = 10;
const INITIAL = 5;
const STEPS = [1, 3] as const;

export default function UseCounterDemo() {
  const [step, setStep] = useState<(typeof STEPS)[number]>(1);
  const { count, inc, dec, set, reset } = useCounter(INITIAL, {
    min: MIN,
    max: MAX,
  });

  const progress = (count - MIN) / (MAX - MIN);
  const atMin = count <= MIN;
  const atMax = count >= MAX;
  const atEdge = atMin || atMax;

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div
            role="group"
            aria-label="Step delta"
            className="flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {STEPS.map((s) => {
              const active = step === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStep(s)}
                  className={cn(
                    "rounded-[3px] px-2 py-0.5 font-mono text-3xs font-medium tabular-nums transition-all",
                    active
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  ±{s}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2.5 rounded-md border border-border-subtle bg-subtle/35 p-3">
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="secondary"
              size="compact"
              onClick={() => dec(step)}
              disabled={atMin}
              aria-label={`Decrement by ${step}`}
              className="w-14 font-mono tabular-nums"
            >
              <MinusIcon />
              {step}
            </Button>

            <output className="font-mono text-2xl font-semibold tracking-tight text-foreground tabular-nums">
              {count}
            </output>

            <Button
              variant="primary"
              size="compact"
              onClick={() => inc(step)}
              disabled={atMax}
              aria-label={`Increment by ${step}`}
              className="w-14 font-mono tabular-nums"
            >
              <PlusIcon />
              {step}
            </Button>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full border border-border-subtle/60 bg-subtle">
            <div
              className={cn(
                "h-full w-full origin-left transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
                atEdge ? "bg-warning" : "bg-primary",
              )}
              style={{
                transform: `scale3d(${progress}, 1, 1)`,
              }}
            />
          </div>
        </div>
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Bound State
          </span>
          <div className="flex items-center">
            <Badge variant={atEdge ? "warning" : "default"} className="font-mono uppercase">
              {atMin ? "Min Limit" : atMax ? "Max Limit" : "In Range"}
            </Badge>
          </div>
        </div>
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Step Delta
          </span>
          <span className="font-mono text-xs font-medium text-foreground tabular-nums">
            ±{step} per click
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          variant="secondary"
          size="compact"
          onClick={() => set(MIN)}
          disabled={count === MIN}
          className="flex-1 font-mono tabular-nums"
        >
          Min ({MIN})
        </Button>
        <Button
          variant="secondary"
          size="compact"
          onClick={() => set(MAX)}
          disabled={count === MAX}
          className="flex-1 font-mono tabular-nums"
        >
          Max ({MAX})
        </Button>
        <Button
          variant="tertiary"
          size="compact"
          onClick={reset}
          disabled={count === INITIAL}
          className="font-mono tabular-nums"
        >
          <RotateCcwIcon />
          {INITIAL}
        </Button>
      </CardFooter>
    </Card>
  );
}
