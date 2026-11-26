"use client";

import { useState } from "react";
import { cn } from "cn";
import { Repeat } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToggle } from "@/hooks/useToggle";

const BOOL_OPTIONS = [false, true] as const;

export default function UseToggleDemo() {
  const [value, toggle] = useToggle(false);
  const [lastCall, setLastCall] = useState("defaultValue: false");

  const handleDirectToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    toggle(e);
    setLastCall("onClick={toggle}");
  };

  const handleExplicitToggle = (next: boolean) => {
    toggle(next);
    setLastCall(`toggle(${String(next)})`);
  };

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div
            role="group"
            aria-label="Explicit boolean value"
            className="inline-flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {BOOL_OPTIONS.map((opt) => {
              const active = value === opt;
              return (
                <button
                  key={String(opt)}
                  type="button"
                  onClick={() => handleExplicitToggle(opt)}
                  className={cn(
                    "rounded-[3px] px-2 py-0.5 font-mono text-2xs font-medium transition-all",
                    active
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {String(opt)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-subtle/35 py-5 font-mono">
          <span
            key={String(value)}
            className={cn(
              "text-2xl font-bold tracking-tight animate-in fade-in zoom-in-95 duration-150 motion-reduce:animate-none",
              value ? "text-primary" : "text-foreground",
            )}
          >
            {String(value)}
          </span>
          <Badge variant="code" size="compact">
            {lastCall}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="border-t">
        <Button
          variant="primary"
          size="compact"
          leadingIcon={<Repeat />}
          onClick={handleDirectToggle}
          className="w-full font-mono"
        >
          toggle()
        </Button>
      </CardFooter>
    </Card>
  );
}
