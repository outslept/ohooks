"use client";

import * as React from "react";
import { Radio, Send } from "lucide-react";
import { useBroadcastChannel } from "@/hooks/useBroadcastChannel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

interface Packet {
  seq: number;
  text: string;
}

const LISTENER_MODES = [
  { value: true, label: "Listening" },
  { value: false, label: "Closed" },
] as const;

export function UseBroadcastChannelDemo() {
  const [input, setInput] = React.useState("sync_state");
  const [seq, setSeq] = React.useState(0);
  const [receivedCount, setReceivedCount] = React.useState(0);
  const [listening, setListening] = React.useState(true);

  const sender = useBroadcastChannel<Packet>("demo-sync-channel");
  const receiver = useBroadcastChannel<Packet>("demo-sync-channel", {
    enabled: listening,
    onMessage: () => {
      setReceivedCount((c) => c + 1);
    },
  });

  const broadcast = (payloadText: string) => {
    const trimmed = payloadText.trim() || "ping";
    const nextSeq = seq + 1;
    setSeq(nextSeq);
    sender.postMessage({ seq: nextSeq, text: trimmed });
  };

  const lastPacket = receiver.lastMessage;

  return (
    <Card className="w-full max-w-80">
      <CardContent className="flex flex-col gap-3 pt-4 pb-4">
        <div className="flex items-center justify-between">

          <div
            role="group"
            aria-label="Receiver subscription state"
            className="inline-flex items-center gap-0.5 rounded-sm border border-border-subtle bg-subtle/60 p-0.5"
          >
            {LISTENER_MODES.map((mode) => {
              const selected = listening === mode.value;
              return (
                <button
                  key={mode.label}
                  type="button"
                  onClick={() => setListening(mode.value)}
                  className={cn(
                    "rounded-2xs px-1.5 py-0.5 font-mono text-3xs font-medium outline-none select-none",
                    "transition-colors duration-150 ease-out",
                    selected
                      ? "bg-control text-foreground shadow-control"
                      : "text-muted-foreground pointer-hover:hover:text-foreground",
                    "focus-visible:ring-1 focus-visible:ring-ring"
                  )}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            broadcast(input);
          }}
          className="flex items-center gap-1.5"
        >
          <Input
            size="compact"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Payload..."
            aria-label="Broadcast payload"
            className="font-mono text-xs"
          />
          <Button
            type="submit"
            size="compact"
            variant="secondary"
            leadingIcon={Send}
            disabled={!sender.isSupported}
          >
            Send
          </Button>
        </form>

        <div className="flex h-11 items-center justify-between gap-2 rounded-md border border-border-subtle bg-subtle/35 px-3 font-mono text-xs">
          {lastPacket ? (
            <div
              key={lastPacket.seq}
              className="animate-in fade-in zoom-in-95 flex min-w-0 items-center gap-2 duration-150 ease-snappy"
            >
              <Badge size="compact" variant="code" className="tabular-nums">
                #{lastPacket.seq}
              </Badge>
              <span className="truncate font-medium text-foreground">
                {lastPacket.text}
              </span>
            </div>
          ) : (
            <span className="text-2xs text-muted-foreground">
              {sender.isSupported
                ? "Awaiting broadcast packet…"
                : "BroadcastChannel unsupported"}
            </span>
          )}
        </div>
      </CardContent>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle bg-subtle/20">
        <div className="flex flex-col items-center py-2.5">
          <span className="text-3xs font-medium tracking-wider text-muted-foreground uppercase">
            Sent
          </span>
          <span className="mt-0.5 font-mono text-xs font-medium text-foreground tabular-nums">
            {seq}
          </span>
        </div>
        <div className="flex flex-col items-center py-2.5">
          <span className="text-3xs font-medium tracking-wider text-muted-foreground uppercase">
            Received
          </span>
          <span className="mt-0.5 font-mono text-xs font-medium text-foreground tabular-nums">
            {receivedCount}
          </span>
        </div>
      </div>

      <CardFooter className="border-t">
        <Button
          size="compact"
          variant="secondary"
          leadingIcon={Radio}
          disabled={!sender.isSupported}
          onClick={() => broadcast(input)}
          className="w-full font-mono tabular-nums"
        >
          Broadcast #{seq + 1}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default UseBroadcastChannelDemo;
