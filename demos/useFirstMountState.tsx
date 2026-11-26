"use client";

import { useState } from "react";
import { RefreshCwIcon, RotateCcwIcon } from "lucide-react";
import { cn } from "cn";

import { useFirstMountState } from "@/hooks/useFirstMountState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface ProbeReadoutProps {
  instanceId: number;
  renderPass: number;
}

function ProbeReadout({ instanceId, renderPass }: ProbeReadoutProps) {
  const isFirstMount = useFirstMountState();

  return (
    <>
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="code" size="compact" className="tabular-nums">
            instance #{instanceId}
          </Badge>
        </div>

        <div
          className={cn(
            "flex items-center justify-between rounded-md border px-3.5 py-3 transition-colors",
            isFirstMount ? "border-primary/30 bg-primary/5" : "border-border-subtle bg-subtle/35",
          )}
        >
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
              useFirstMountState()
            </span>
            <span className="font-mono text-lg font-semibold tracking-tight text-foreground">
              {String(isFirstMount)}
            </span>
          </div>

          <Badge
            variant={isFirstMount ? "accent" : "secondary"}
            size="compact"
            className="uppercase"
          >
            {isFirstMount ? "First Pass" : "Updated"}
          </Badge>
        </div>
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Render Pass
          </span>
          <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
            #{renderPass}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <span className="font-mono text-3xs tracking-wider text-muted-foreground uppercase">
            Mount Cycle
          </span>
          <span className="font-mono text-xs font-semibold text-primary tabular-nums">
            #{instanceId}
          </span>
        </div>
      </div>
    </>
  );
}

export default function UseFirstMountStateDemo() {
  const [instanceId, setInstanceId] = useState(1);
  const [renderPass, setRenderPass] = useState(1);

  return (
    <Card className="w-full max-w-80">
      <ProbeReadout key={instanceId} instanceId={instanceId} renderPass={renderPass} />

      <CardFooter className="border-t">
        <Button
          variant="primary"
          size="compact"
          onClick={() => setRenderPass((r) => r + 1)}
          className="flex-1"
        >
          <RefreshCwIcon />
          Re-render
        </Button>
        <Button
          variant="secondary"
          size="compact"
          onClick={() => {
            setInstanceId((id) => id + 1);
            setRenderPass(1);
          }}
          className="flex-1"
        >
          <RotateCcwIcon />
          Remount
        </Button>
      </CardFooter>
    </Card>
  );
}
