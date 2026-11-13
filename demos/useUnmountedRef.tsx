'use client';

import { useEffect, useState } from 'react';
import { Loader2, Play, RotateCcw } from 'lucide-react';
import { useUnmountedRef } from '@/hooks/useUnmountedRef';

type TaskPhase = 'idle' | 'pending' | 'committed' | 'guarded';

const MOUNT_OPTIONS = [
  { label: 'true', value: true },
  { label: 'false', value: false },
] as const;

function WorkerProbe({
  runId,
  onPhaseChange,
}: {
  runId: number;
  onPhaseChange: (phase: TaskPhase, unmounted: boolean) => void;
}) {
  const isUnmountedRef = useUnmountedRef();
  const [, setSafeUpdates] = useState(0);

  useEffect(() => {
    onPhaseChange('idle', isUnmountedRef.current);
    return () => {
      onPhaseChange('idle', isUnmountedRef.current);
    };
  }, [isUnmountedRef, onPhaseChange]);

  useEffect(() => {
    if (runId === 0) return;

    onPhaseChange('pending', isUnmountedRef.current);

    const timer = window.setTimeout(() => {
      if (isUnmountedRef.current) {
        onPhaseChange('guarded', true);
        return;
      }
      setSafeUpdates((c) => c + 1);
      onPhaseChange('committed', false);
    }, 1500);

    return () => {
      void timer;
    };
  }, [runId, isUnmountedRef, onPhaseChange]);

  return null;
}

export default function UseUnmountedRefDemo() {
  const [mountIdx, setMountIdx] = useState(0);
  const isMounted = MOUNT_OPTIONS[mountIdx].value;

  const [runId, setRunId] = useState(0);
  const [phase, setPhase] = useState<TaskPhase>('idle');
  const [refValue, setRefValue] = useState(false);
  const [fillBar, setFillBar] = useState(false);

  const isPending = phase === 'pending';

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

  const handlePhaseChange = (nextPhase: TaskPhase, unmounted: boolean) => {
    setRefValue(unmounted);
    setPhase((prev) => {
      if (prev === 'pending' && nextPhase === 'idle') {
        return 'pending';
      }
      return nextPhase;
    });
  };

  const handleRun = () => {
    if (!isMounted) {
      setMountIdx(0);
    }
    setRunId((id) => id + 1);
  };

  const handleReset = () => {
    setMountIdx(0);
    setRunId(0);
    setPhase('idle');
    setRefValue(false);
  };

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      {isMounted && (
        <WorkerProbe runId={runId} onPhaseChange={handlePhaseChange} />
      )}

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
            key={`${phase}-${refValue}`}
            className="animate-in fade-in zoom-in-95 flex flex-col items-center gap-1 px-3 font-mono tabular-nums duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:animate-none"
          >
            <div className="flex items-center gap-1.5 text-lg font-semibold tracking-tight text-fd-card-foreground">
              {isPending && (
                <Loader2 className="size-4 animate-spin text-fd-primary [animation-duration:550ms]" />
              )}
              <span>current: {String(refValue)}</span>
            </div>

            <span className="text-[11px] text-fd-muted-foreground">
              {phase === 'idle' &&
                (isMounted ? 'mounted · standby' : 'unmounted · standby')}
              {phase === 'pending' &&
                (isMounted
                  ? '1500ms · toggle mounted → false'
                  : '1500ms · unmounted in-flight')}
              {phase === 'committed' && 'resolved · setState executed'}
              {phase === 'guarded' && 'resolved · setState skipped'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5 font-mono tabular-nums">
          <button
            type="button"
            disabled={isPending}
            onClick={handleRun}
            className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary/10 px-3 py-1 text-[11px] font-semibold text-fd-primary transition-[transform,opacity,background-color] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
          >
            <Play className="size-3" />
            Run 1.5s
          </button>
          <button
            type="button"
            disabled={phase === 'idle' && isMounted}
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
