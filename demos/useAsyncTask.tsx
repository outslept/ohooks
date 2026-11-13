'use client';

import { useEffect, useState } from 'react';
import { Loader2, Play, RotateCcw, Square } from 'lucide-react';
import { useAsyncTask } from '@/hooks/useAsyncTask';

interface TaskPayload {
  id: number;
  timestamp: string;
}

const MODE_OPTIONS = [
  { label: 'Resolve', shouldFail: false },
  { label: 'Reject', shouldFail: true },
] as const;

export default function UseAsyncTaskDemo() {
  const [modeIdx, setModeIdx] = useState(0);
  const [runId, setRunId] = useState(0);
  const [fillBar, setFillBar] = useState(false);

  const shouldFail = MODE_OPTIONS[modeIdx].shouldFail;

  const { run, abort, reset, status, data, error, isIdle, isPending } =
    useAsyncTask(
      async ({ signal }, fail: boolean): Promise<TaskPayload> => {
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(resolve, 1500);
          signal.addEventListener(
            'abort',
            () => {
              clearTimeout(timer);
              reject(new DOMException('Aborted', 'AbortError'));
            },
            { once: true },
          );
        });

        if (fail) {
          throw new Error('503 Service Unavailable');
        }

        return {
          id: Math.floor(Math.random() * 900 + 100),
          timestamp: new Date().toLocaleTimeString([], {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        };
      },
    );

  useEffect(() => {
    if (!isPending) {
      setFillBar(false);
      return;
    }
    setFillBar(false);
    const frame = requestAnimationFrame(() => {
      setFillBar(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [isPending, runId]);

  const handleRun = () => {
    setRunId((prev) => prev + 1);
    void run(shouldFail);
  };

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
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

        <div className="relative flex h-24 w-60 items-center justify-center border border-fd-primary/25 bg-fd-card/70 shadow-2xs backdrop-blur-[2px]">
          <span
            aria-hidden="true"
            className="absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isPending ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isPending ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isPending ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-px -right-px size-2 border-b-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: isPending ? 1 : 0.45 }}
          />

          {isPending && (
            <span
              key={runId}
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left bg-fd-primary transition-transform duration-[1500ms] ease-linear motion-reduce:transition-none"
              style={{
                transform: fillBar ? 'scaleX(1)' : 'scaleX(0)',
              }}
            />
          )}

          <div
            key={`${status}-${runId}`}
            className="animate-in fade-in zoom-in-95 flex flex-col items-center gap-1 px-3 font-mono tabular-nums duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:animate-none"
          >
            {status === 'idle' && (
              <>
                <span className="text-lg font-semibold tracking-tight text-fd-card-foreground">
                  idle
                </span>
                <span className="text-[11px] text-fd-muted-foreground">
                  signal: standby
                </span>
              </>
            )}

            {status === 'pending' && (
              <>
                <div className="flex items-center gap-1.5 text-lg font-semibold tracking-tight text-fd-card-foreground">
                  <Loader2 className="size-4 animate-spin text-fd-primary [animation-duration:550ms]" />
                  <span>pending</span>
                </div>
                <span className="text-[11px] text-fd-muted-foreground">
                  1500ms · abortable
                </span>
              </>
            )}

            {status === 'success' && data && (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-semibold tracking-tight text-fd-card-foreground">
                    #{data.id}
                  </span>
                  <span className="rounded bg-fd-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-fd-primary">
                    200 OK
                  </span>
                </div>
                <span className="text-[11px] text-fd-muted-foreground">
                  resolved · {data.timestamp}
                </span>
              </>
            )}

            {status === 'error' && error && (
              <>
                <span className="text-lg font-semibold tracking-tight text-red-500">
                  error
                </span>
                <span className="text-[11px] text-fd-muted-foreground">
                  {error.message}
                </span>
              </>
            )}

            {status === 'aborted' && (
              <>
                <span className="text-lg font-semibold tracking-tight text-fd-card-foreground">
                  aborted
                </span>
                <span className="text-[11px] text-fd-muted-foreground">
                  AbortSignal triggered
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
            onClick={handleRun}
            className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary/10 px-3 py-1 text-[11px] font-semibold text-fd-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
          >
            <Play className="size-3" />
            Run
          </button>
          <button
            type="button"
            disabled={!isPending}
            onClick={() => abort()}
            className="inline-flex items-center gap-1 rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,opacity,background-color] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            <Square className="size-3" />
            Abort
          </button>
          <button
            type="button"
            disabled={isIdle}
            onClick={reset}
            aria-label="Reset state"
            className="inline-flex items-center gap-1 rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,opacity,background-color] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            <RotateCcw className="size-3" />
            Reset
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-fd-muted-foreground">
            outcome
          </span>
          <div
            role="group"
            aria-label="Task outcome"
            className="relative grid grid-cols-2 rounded-lg border bg-fd-muted/50 p-0.5 font-mono text-[11px] tabular-nums"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-[6px] bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
              style={{
                transform: `translate3d(${modeIdx * 100}%, 0, 0)`,
              }}
            />
            {MODE_OPTIONS.map((opt, idx) => {
              const active = idx === modeIdx;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setModeIdx(idx)}
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
