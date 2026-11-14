"use client";

import { Check, RefreshCw, X } from "lucide-react";
import { useBoolean } from "@/hooks/useBoolean";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "cn";

export function UseBooleanDemo() {
  const { value, setValue, setTrue, setFalse, toggle } = useBoolean(true);

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">

        <div className="relative flex h-24 w-full flex-col items-center justify-center gap-2.5 rounded-md border border-border-subtle bg-subtle/35 px-4">
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-1.5 left-1.5 size-2 border-t-[1.5px] border-l-[1.5px] border-foreground transition-opacity duration-200",
              value ? "opacity-85" : "opacity-25"
            )}
          />
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-1.5 right-1.5 size-2 border-t-[1.5px] border-r-[1.5px] border-foreground transition-opacity duration-200",
              value ? "opacity-85" : "opacity-25"
            )}
          />
          <span
            aria-hidden="true"
            className={cn(
              "absolute bottom-1.5 left-1.5 size-2 border-b-[1.5px] border-l-[1.5px] border-foreground transition-opacity duration-200",
              value ? "opacity-85" : "opacity-25"
            )}
          />
          <span
            aria-hidden="true"
            className={cn(
              "absolute right-1.5 bottom-1.5 size-2 border-r-[1.5px] border-b-[1.5px] border-foreground transition-opacity duration-200",
              value ? "opacity-85" : "opacity-25"
            )}
          />

          <span className="font-mono text-xl font-semibold tracking-tight text-foreground">
            {String(value)}
          </span>

          <button
            type="button"
            role="switch"
            aria-checked={value}
            aria-label="Toggle boolean via setValue"
            onClick={() => setValue((prev) => !prev)}
            className={cn(
              "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border p-0.5 outline-none select-none",
              "transition-[background-color,border-color,transform] duration-150 ease-out active:scale-95",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
              value
                ? "border-primary bg-primary"
                : "border-border-hover bg-muted"
            )}
          >
            <span
              className={cn(
                "block size-3.5 rounded-full shadow-2xs transition-[transform,background-color] duration-200 ease-snappy",
                value ? "bg-primary-foreground" : "bg-muted-foreground"
              )}
              style={{
                transform: `translate3d(${value ? 16 : 0}px, 0, 0)`,
              }}
            />
          </button>
        </div>
      </CardContent>

      <CardFooter className="border-t">
        <Button
          size="compact"
          variant="primary"
          leadingIcon={RefreshCw}
          onClick={toggle}
          className="flex-1 font-mono"
        >
          toggle()
        </Button>

        <Button
          size="compact"
          variant="secondary"
          leadingIcon={Check}
          disabled={value}
          onClick={setTrue}
          className="font-mono"
        >
          setTrue
        </Button>

        <Button
          size="compact"
          variant="secondary"
          leadingIcon={X}
          disabled={!value}
          onClick={setFalse}
          className="font-mono"
        >
          setFalse
        </Button>
      </CardFooter>
    </Card>
  );
}

export default UseBooleanDemo;
