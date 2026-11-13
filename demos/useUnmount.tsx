'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { useUnmount } from '@/hooks/useUnmount';

interface UnmountSnapshot {
  step: number;
  runs: number;
  time: string;
}

const MOUNT_OPTIONS = [
  { label: 'true', value: true },
  { label: 'false', value: false },
] as const;

function UnmountProbe({
  step,
  onFlushed,
}: {
  step: number;
  onFlushed: (capturedStep: number, time: string) => void;
}) {
  const activeRef = useRef(false);

  useEffect(() => {
    activeRef.current = true;
  }, []);

  useUnmount(() => {
    activeRef.current = false;
    const capturedStep = step;
    const time = new Date().toLocaleTimeString([], {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    queueMicrotask(() => {
      if (!activeRef.current) {
        onFlushed(capturedStep, time);
      }
    });
  });

  return null;
}

export default function UseUnmountDemo() {
  const [mountIdx, setMountIdx] = useState(0);
  const isMounted = MOUNT_OPTIONS[mountIdx].value;

  const [step, setStep] = useState(0);
  const [snapshot, setSnapshot] = useState<UnmountSnapshot | null>(null);

  const handleFlushed = (capturedStep: number, time: string) => {
    setSnapshot((prev) => ({
      step: capturedStep,
      runs: (prev?.runs ?? 0) + 1,
      time,
    }));
  };

  const handleReset = () => {
    setMountIdx(0);
    setStep(0);
    setSnapshot(null);
  };

  const canReset = !isMounted || step > 0 || snapshot !== null;

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      {isMounted && <UnmountProbe step={step} onFlushed={handleFlushed} />}

      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border bg-fd-muted/30">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div
          className="relative flex h-24 w-64 items-center justify-center border border-fd-primary/25 bg-fd-card/70 shadow-2xs backdrop-blur-[2px] transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
          style={{
            transform: isMounted ? 'scale(1)' : 'scale(0.97)',
          }}
        >
          <span
            aria-hidden="true"
            className="absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isMounted ? 1 : 0.35 }}
          />
          <span
            aria-hidden="true"
            className="absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isMounted ? 1 : 0.35 }}
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isMounted ? 1 : 0.35 }}
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-px -right-px size-2 border-b-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isMounted ? 1 : 0.35 }}
          />

          <div
            key={`${isMounted}-${snapshot?.runs ?? 0}`}
            className="animate-in fade-in zoom-in-95 flex flex-col items-center gap-1 px-3 font-mono tabular-nums duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:animate-none"
          >
            {isMounted ? (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-semibold tracking-tight text-fd-card-foreground">
                    mounted
                  </span>
                  <span className="rounded bg-fd-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-fd-primary">
                    state {step}
                  </span>
                </div>
                <span className="text-[11px] text-fd-muted-foreground">
                  {snapshot
                    ? `unmounts: ${snapshot.runs} · last state ${snapshot.step}`
                    : 'unmounts: 0 · awaiting unmount'}
                </span>
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-semibold tracking-tight text-fd-card-foreground">
                    unmounted
                  </span>
                  <span className="rounded bg-fd-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-fd-primary">
                    flushed #{snapshot?.runs ?? 1}
                  </span>
                </div>
                <span className="text-[11px] text-fd-muted-foreground">
                  captured state {snapshot?.step ?? step} · {snapshot?.time}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5 font-mono tabular-nums">
          <button
            type="button"
            disabled={!isMounted}
            onClick={() => setStep((s) => s + 1)}
            className="inline-flex items-center gap-1 rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[transform,opacity,background-color] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
          >
            <Plus className="size-3" />
            state ({step})
          </button>
          <button
            type="button"
            disabled={!canReset}
            onClick={handleReset}
            aria-label="Reset state"
            className="inline-flex items-center gap-1 rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,opacity,background-color] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            <RotateCcw className="size-3" />
            Reset
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-fd-muted-foreground">
            mounted
          </span>
          <div
            role="group"
            aria-label="Component mount state"
            className="relative grid grid-cols-2 rounded-lg border bg-fd-muted/50 p-0.5 font-mono text-[11px] tabular-nums"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-[6px] bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
              style={{
                transform: `translate3d(${mountIdx * 100}%, 0, 0)`,
              }}
            />
            {MOUNT_OPTIONS.map((opt, idx) => {
              const active = idx === mountIdx;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setMountIdx(idx)}
                  className={`relative z-10 rounded-[6px] px-2.5 py-1 text-center font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                    active
                      ? 'text-fd-card-foreground'
                      : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
