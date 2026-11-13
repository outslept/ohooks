'use client';

import { useState } from 'react';
import { useBroadcastChannel } from '@/hooks/useBroadcastChannel';

interface Packet {
  seq: number;
  text: string;
}

const LISTENER_MODES = [
  { value: true, label: 'Listening' },
  { value: false, label: 'Closed' },
] as const;

export default function UseBroadcastChannelDemo() {
  const [input, setInput] = useState('sync_state');
  const [seq, setSeq] = useState(0);
  const [receivedCount, setReceivedCount] = useState(0);
  const [listening, setListening] = useState(true);

  const sender = useBroadcastChannel<Packet>('demo-sync-channel');
  const receiver = useBroadcastChannel<Packet>('demo-sync-channel', {
    enabled: listening,
    onMessage: () => {
      setReceivedCount((c) => c + 1);
    },
  });

  const broadcast = (payloadText: string) => {
    const trimmed = payloadText.trim() || 'ping';
    const nextSeq = seq + 1;
    setSeq(nextSeq);
    sender.postMessage({ seq: nextSeq, text: trimmed });
  };

  const activeModeIdx = listening ? 0 : 1;
  const lastPacket = receiver.lastMessage;

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border bg-fd-muted/30 px-3">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div className="relative flex w-full max-w-xs flex-col gap-2.5 border border-fd-primary/25 bg-fd-card/85 p-3.5 shadow-2xs backdrop-blur-[2px]">
          <span
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: listening ? 1 : 0.35 }}
          />
          <span
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: listening ? 1 : 0.35 }}
          />
          <span
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: listening ? 1 : 0.35 }}
          />
          <span
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: listening ? 1 : 0.35 }}
          />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              broadcast(input);
            }}
            className="flex gap-1.5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Payload..."
              aria-label="Broadcast payload"
              className="min-w-0 flex-1 rounded-md border bg-fd-background/80 px-2.5 py-1 font-mono text-xs text-fd-foreground placeholder:text-fd-muted-foreground/60 focus:border-fd-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={!sender.isSupported}
              className="rounded-md bg-fd-primary/15 px-2.5 py-1 font-mono text-[11px] font-semibold text-fd-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/25 motion-reduce:transition-none"
            >
              Send
            </button>
          </form>

          <div className="flex items-center justify-between gap-2 font-mono text-xs tabular-nums">
            {lastPacket ? (
              <div
                key={lastPacket.seq}
                className="flex min-w-0 items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:animate-none"
              >
                <span className="rounded bg-fd-primary/15 px-1 py-0.2 text-[10px] font-semibold text-fd-primary">
                  #{lastPacket.seq}
                </span>
                <span className="truncate font-semibold text-fd-foreground">
                  {lastPacket.text}
                </span>
              </div>
            ) : (
              <span className="text-[11px] text-fd-muted-foreground">
                {sender.isSupported ? 'awaiting broadcast...' : 'unsupported'}
              </span>
            )}

            <span className="shrink-0 text-[10px] text-fd-muted-foreground">
              rx: {receivedCount}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <button
          type="button"
          onClick={() => broadcast(input)}
          disabled={!sender.isSupported}
          className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 font-mono text-[11px] font-medium tabular-nums text-fd-card-foreground transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 motion-reduce:transition-none"
        >
          Broadcast #{seq + 1}
        </button>

        <div
          role="group"
          aria-label="Receiver subscription state"
          className="relative grid grid-cols-2 rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeModeIdx * 100}%, 0, 0)`,
            }}
          />
          {LISTENER_MODES.map((mode) => {
            const active = listening === mode.value;
            return (
              <button
                key={mode.label}
                type="button"
                onClick={() => setListening(mode.value)}
                className={`relative z-10 rounded-md px-2 py-0.5 font-mono text-[11px] font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                  active
                    ? 'text-fd-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-foreground'
                }`}
              >
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
