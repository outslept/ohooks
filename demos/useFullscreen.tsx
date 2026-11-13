'use client';

import { useRef, useState } from 'react';
import { useFullscreen } from '@/hooks/useFullscreen';

const TARGET_OPTIONS = [
  { label: 'element', mode: 'element' },
  { label: 'document', mode: 'document' },
] as const;

type TargetMode = (typeof TARGET_OPTIONS)[number]['mode'];

export default function UseFullscreenDemo() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [targetMode, setTargetMode] = useState<TargetMode>('element');
  const [enterCount, setEnterCount] = useState<number>(0);

  const { isFullscreen, isSupported, enter, exit, toggle } = useFullscreen(
    targetMode === 'element' ? cardRef : undefined,
    {
      onEnter: () => setEnterCount((c) => c + 1),
    },
  );

  const activeTargetIdx = TARGET_OPTIONS.findIndex(
    (o) => o.mode === targetMode,
  );

  return (
    <div
      ref={cardRef}
      className="flex w-full flex-col justify-center gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs fullscreen:p-8"
    >
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border bg-fd-muted/30 px-4">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div
          style={{
            transform: isFullscreen
              ? 'scale3d(1.04, 1.04, 1)'
              : 'scale3d(1, 1, 1)',
          }}
          className={`relative z-10 flex min-w-56 flex-col items-center gap-2 border px-6 py-4 shadow-2xs backdrop-blur-[2px] transition-[transform,border-color,background-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none ${
            isFullscreen
              ? 'border-fd-primary/60 bg-fd-primary/10'
              : 'border-fd-primary/25 bg-fd-card/85'
          }`}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isFullscreen ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isFullscreen ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isFullscreen ? 1 : 0.45 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isFullscreen ? 1 : 0.45 }}
          />

          <div className="flex items-center gap-2">
            <span
              className={`size-2 rounded-full transition-colors duration-150 ease-out ${
                isFullscreen ? 'bg-fd-primary' : 'bg-fd-muted-foreground/40'
              }`}
            />
            <span className="font-mono text-sm font-semibold tracking-wider text-fd-card-foreground uppercase">
              {isFullscreen ? 'fullscreen' : 'windowed'}
            </span>
          </div>

          <span className="font-mono text-[11px] text-fd-muted-foreground tabular-nums">
            target: <strong className="text-fd-card-foreground">{targetMode}</strong> · enters: <strong className="text-fd-card-foreground">{enterCount}</strong>
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => void toggle()}
            disabled={!isSupported}
            className="rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[background-color,transform,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15 motion-reduce:transition-none"
          >
            toggle()
          </button>
          <button
            type="button"
            onClick={() => void enter()}
            disabled={!isSupported || isFullscreen}
            className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[background-color,transform,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 motion-reduce:transition-none"
          >
            enter()
          </button>
          <button
            type="button"
            onClick={() => void exit()}
            disabled={!isSupported || !isFullscreen}
            className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[background-color,transform,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 motion-reduce:transition-none"
          >
            exit()
          </button>
        </div>

        <div
          role="group"
          aria-label="Fullscreen target"
          className="relative grid grid-cols-2 rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeTargetIdx * 100}%, 0, 0)`,
            }}
          />
          {TARGET_OPTIONS.map((option) => {
            const active = targetMode === option.mode;
            return (
              <button
                key={option.mode}
                type="button"
                onClick={() => {
                  if (isFullscreen) {
                    void exit();
                  }
                  setTargetMode(option.mode);
                }}
                className={`relative z-10 rounded-md px-2.5 py-1 font-mono text-[11px] font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                  active
                    ? 'text-fd-card-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
