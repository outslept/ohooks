"use client";

import { useState } from "react";
import { cn } from "cn";
import { Lock, Smartphone, Unlock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useScreenOrientation } from "@/hooks/useScreenOrientation";

const LOCK_TARGETS = ["portrait", "landscape"] as const;
type LockTarget = (typeof LOCK_TARGETS)[number];

export default function UseScreenOrientationDemo() {
  const { type, angle, lock, unlock } = useScreenOrientation();
  const [target, setTarget] = useState<LockTarget>("portrait");
  const [_statusNote, setStatusNote] = useState<string>("ready");
  const [isLocked, setIsLocked] = useState(false);

  const handleLock = async (orientation: LockTarget = target) => {
    setTarget(orientation);
    try {
      await lock(orientation);
      setIsLocked(true);
      setStatusNote(`locked → ${orientation}`);
    } catch (err) {
      setIsLocked(false);
      const raw = err instanceof Error ? err.message : "requires mobile fullscreen";
      setStatusNote(raw.replace(/^.*:\s*/, "").toLowerCase());
    }
  };

  const handleUnlock = () => {
    try {
      unlock();
      setIsLocked(false);
      setStatusNote("orientation unlocked");
    } catch (err) {
      setStatusNote(err instanceof Error ? err.message : "unlock failed");
    }
  };

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div
            role="group"
            aria-label="Target lock orientation"
            className="inline-flex items-center rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {LOCK_TARGETS.map((mode) => {
              const active = target === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleLock(mode)}
                  className={cn(
                    "rounded-[3px] px-2 py-0.5 font-mono text-2xs font-medium capitalize transition-all",
                    active
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2.5 rounded-md border border-border-subtle bg-subtle/35 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-sm border border-primary/25 bg-primary/10 text-primary">
                <Smartphone
                  className="size-4 transition-transform duration-200 ease-out motion-reduce:transition-none"
                  style={{
                    transform: `rotate3d(0, 0, 1, ${angle}deg)`,
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
                  Current Type
                </span>
                <span className="font-mono text-xs font-semibold text-foreground">
                  {type || "unknown"}
                </span>
              </div>
            </div>

            <Badge variant={isLocked ? "accent" : "code"} size="compact" className="tabular-nums">
              {angle}°
            </Badge>
          </div>
        </div>
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-4 py-2.5">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Lock State
          </span>
          <span className="font-mono text-xs font-semibold text-foreground">
            {isLocked ? "locked" : "unlocked"}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-4 py-2.5">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Angle
          </span>
          <span className="font-mono text-xs font-semibold tabular-nums text-primary">
            {angle} deg
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          variant="primary"
          size="compact"
          leadingIcon={Lock}
          onClick={() => handleLock(target)}
          className="flex-1 capitalize"
        >
          Lock {target}
        </Button>
        <Button variant="secondary" size="compact" leadingIcon={Unlock} onClick={handleUnlock}>
          {isLocked ? "Unlock" : "Release"}
        </Button>
      </CardFooter>
    </Card>
  );
}
