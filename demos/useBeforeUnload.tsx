"use client";

import * as React from "react";
import { Check, RotateCcw, ShieldAlert } from "lucide-react";
import { useBeforeUnload } from "@/hooks/useBeforeUnload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function UseBeforeUnloadDemo() {
  const [draft, setDraft] = React.useState("Unsaved article draft");
  const [savedDraft, setSavedDraft] = React.useState("Unsaved article draft");
  const [lastCheck, setLastCheck] = React.useState<
    "blocked" | "allowed" | null
  >(null);

  const isDirty = draft !== savedDraft;
  useBeforeUnload(isDirty, "You have unsaved changes.");

  const testUnloadGuard = () => {
    if (typeof window === "undefined") return;
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    setLastCheck(event.defaultPrevented ? "blocked" : "allowed");
  };

  const handleSave = () => {
    setSavedDraft(draft);
    setLastCheck(null);
  };

  const handleDiscard = () => {
    setDraft(savedDraft);
    setLastCheck(null);
  };

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex h-5 items-center justify-between">

          {lastCheck ? (
            <Badge
              key={`${lastCheck}-${String(isDirty)}`}
              size="compact"
              variant={lastCheck === "blocked" ? "warning" : "code"}
              className="animate-in fade-in zoom-in-95 font-mono uppercase duration-150 ease-snappy"
            >
              {lastCheck}
            </Badge>
          ) : (
            <Badge size="compact" variant="secondary" className="font-mono">
              {isDirty ? "DIRTY" : "SAVED"}
            </Badge>
          )}
        </div>

        <Input
          size="compact"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setLastCheck(null);
          }}
          placeholder="Edit draft to arm guard..."
          aria-label="Draft content"
          className="font-mono text-xs"
        />
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col items-center py-2.5">
          <span className="text-3xs font-medium tracking-wider text-muted-foreground uppercase">
            Listener
          </span>
          <span className="mt-0.5 font-mono text-xs font-medium text-foreground tabular-nums">
            {isDirty ? "active" : "standby"}
          </span>
        </div>
        <div className="flex flex-col items-center py-2.5">
          <span className="text-3xs font-medium tracking-wider text-muted-foreground uppercase">
            Last Dispatch
          </span>
          <span className="mt-0.5 font-mono text-xs font-medium text-foreground tabular-nums">
            {lastCheck ?? "—"}
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          size="compact"
          variant={isDirty ? "primary" : "secondary"}
          leadingIcon={Check}
          disabled={!isDirty}
          onClick={handleSave}
        >
          Save
        </Button>

        <Button
          size="compact"
          variant="secondary"
          leadingIcon={RotateCcw}
          disabled={!isDirty}
          onClick={handleDiscard}
          aria-label="Discard changes"
        >
          Discard
        </Button>

        <Button
          size="compact"
          variant="secondary"
          leadingIcon={ShieldAlert}
          onClick={testUnloadGuard}
          className="ml-auto"
        >
          Test unload
        </Button>
      </CardFooter>
    </Card>
  );
}

export default UseBeforeUnloadDemo;
