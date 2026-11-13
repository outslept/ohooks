'use client';

import { ArrowRight, Play, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useQueue } from '@/hooks/useQueue';

const INITIAL_JOBS = ['#101', '#102', '#103'] as const;
const BATCH_OPTIONS = [1, 2] as const;

export default function UseQueueDemo() {
  const {
    queue,
    size,
    first,
    last,
    isEmpty,
    enqueue,
    dequeue,
    clear,
    reset,
  } = useQueue<string>(INITIAL_JOBS);

  const [batchSize, setBatchSize] = useState<(typeof BATCH_OPTIONS)[number]>(1);
  const [lastDequeued, setLastDequeued] = useState<string | null>(null);
  const nextIdRef = useRef(104);

  const handleEnqueue = () => {
    const items: string[] = [];
    for (let i = 0; i < batchSize; i += 1) {
      items.push(`#${nextIdRef.current++}`);
    }
    enqueue(...items);
  };

  const handleDequeue = () => {
    const removed = dequeue();
    if (removed !== undefined) {
      setLastDequeued(removed);
    }
  };

  const handleReset = () => {
    nextIdRef.current = 104;
    setLastDequeued(null);
    reset();
  };

  const handleClear = () => {
    setLastDequeued(null);
    clear();
  };

  const batchIndex = BATCH_OPTIONS.indexOf(batchSize);

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border bg-fd-muted/30">
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div className="relative flex w-80 max-w-[calc(100%-1.5rem)] flex-col gap-2.5 border border-fd-primary/25 bg-fd-card/70 p-3.5 shadow-2xs backdrop-blur-[2px]">
          <span
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: !isEmpty ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: !isEmpty ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: !isEmpty ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: !isEmpty ? 1 : 0.45 }}
          />

          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wider uppercase text-fd-muted-foreground">
              <span
                className={`size-1.5 rounded-full transition-colors duration-150 ease-out ${
                  !isEmpty ? 'bg-fd-primary' : 'bg-fd-muted-foreground/40'
                }`}
              />
              {isEmpty ? 'empty' : 'fifo queue'}
              {lastDequeued && (
                <span className="text-fd-primary normal-case">
                  · out {lastDequeued}
                </span>
              )}
            </span>
            <span className="font-mono text-[10px] tabular-nums text-fd-muted-foreground">
              size: <strong className="text-fd-card-foreground">{size}</strong>
            </span>
          </div>

          <div className="flex h-11 items-center gap-1.5 overflow-x-auto border-y border-fd-border/60 py-2">
            {isEmpty ? (
              <span className="w-full text-center font-mono text-[11px] text-fd-muted-foreground">
                queue: []
              </span>
            ) : (
              queue.map((job, index) => (
                <div
                  key={job}
                  className="flex shrink-0 items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:animate-none"
                >
                  <span
                    className={`border px-2 py-0.5 font-mono text-xs font-semibold tabular-nums ${
                      index === 0
                        ? 'border-fd-primary/50 bg-fd-primary/15 text-fd-primary'
                        : 'border-fd-border/70 bg-fd-background/80 text-fd-card-foreground'
                    }`}
                  >
                    {job}
                  </span>
                  {index < queue.length - 1 && (
                    <ArrowRight className="size-3 text-fd-muted-foreground/60" />
                  )}
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between font-mono text-[10px] tabular-nums text-fd-muted-foreground">
            <span>
              first:{' '}
              <strong className="text-fd-primary">{first ?? 'undefined'}</strong>
            </span>
            <span>
              last:{' '}
              <strong className="text-fd-card-foreground">
                {last ?? 'undefined'}
              </strong>
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleEnqueue}
            className="inline-flex items-center gap-1 rounded-lg bg-fd-primary/10 px-2.5 py-1 font-mono text-[11px] font-semibold tabular-nums text-fd-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
          >
            <Plus className="size-3" />
            Enqueue +{batchSize}
          </button>

          <button
            type="button"
            onClick={handleDequeue}
            disabled={isEmpty}
            className="inline-flex items-center gap-1 rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            <Play className="size-2.5" />
            Dequeue
          </button>

          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset queue to initial jobs"
            className="inline-flex size-6 items-center justify-center rounded-lg border bg-fd-muted/40 text-fd-muted-foreground transition-[transform,color,background-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground"
          >
            <RotateCcw className="size-3" />
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={isEmpty}
            aria-label="Clear queue"
            className="inline-flex size-6 items-center justify-center rounded-lg border bg-fd-muted/40 text-fd-muted-foreground transition-[transform,color,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground"
          >
            <Trash2 className="size-3" />
          </button>
        </div>

        <div
          role="group"
          aria-label="Enqueue batch count"
          className="relative grid grid-cols-2 rounded-lg border bg-fd-muted/50 p-0.5"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${batchIndex * 100}%, 0, 0)`,
            }}
          />
          {BATCH_OPTIONS.map((count) => {
            const active = batchSize === count;
            return (
              <button
                key={count}
                type="button"
                onClick={() => setBatchSize(count)}
                className={`relative z-10 rounded-md px-2.5 py-0.5 font-mono text-[11px] font-medium tabular-nums transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                  active
                    ? 'text-fd-card-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground'
                }`}
              >
                +{count}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
