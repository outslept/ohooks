'use client';

import { Loader2, PartyPopper, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useScript } from '@/hooks/useScript';

const CONFETTI_CDN =
  'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js';
const ERROR_CDN = 'https://invalid.example.invalid/missing.js';

const SOURCES = [
  { key: 'idle', label: 'Idle', src: null, shortSrc: 'null' },
  {
    key: 'cdn',
    label: 'CDN',
    src: CONFETTI_CDN,
    shortSrc: 'cdn.jsdelivr.net/.../confetti.browser.min.js',
  },
  {
    key: 'error',
    label: 'Error',
    src: ERROR_CDN,
    shortSrc: 'invalid.example.invalid/missing.js',
  },
] as const;

type SourceKey = (typeof SOURCES)[number]['key'];

export default function UseScriptDemo() {
  const [sourceKey, setSourceKey] = useState<SourceKey>('idle');
  const activeSource =
    SOURCES.find((s) => s.key === sourceKey) ?? SOURCES[0];

  const status = useScript(activeSource.src, {
    removeOnUnmount: true,
  });

  const fireConfetti = () => {
    const win = window as unknown as {
      confetti?: (opts: Record<string, unknown>) => void;
    };
    win.confetti?.({
      particleCount: 65,
      spread: 60,
      origin: { y: 0.65 },
      disableForReducedMotion: true,
    });
  };

  const sourceIndex = SOURCES.findIndex((s) => s.key === sourceKey);

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
            style={{ opacity: status === 'ready' ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: status === 'ready' ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: status === 'ready' ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: status === 'ready' ? 1 : 0.45 }}
          />

          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wider uppercase text-fd-muted-foreground">
              {status === 'loading' ? (
                <Loader2 className="size-2.5 animate-spin text-fd-primary motion-reduce:animate-none" />
              ) : (
                <span
                  className={`size-1.5 rounded-full transition-colors duration-150 ease-out ${
                    status === 'ready'
                      ? 'bg-fd-primary'
                      : status === 'error'
                        ? 'bg-red-500'
                        : 'bg-fd-muted-foreground/40'
                  }`}
                />
              )}
              status:{' '}
              <strong
                className={
                  status === 'ready'
                    ? 'text-fd-primary'
                    : status === 'error'
                      ? 'text-red-500'
                      : 'text-fd-card-foreground'
                }
              >
                {status}
              </strong>
            </span>
            <span className="font-mono text-[10px] tabular-nums text-fd-muted-foreground">
              {activeSource.src ? 'in <body />' : 'unmounted'}
            </span>
          </div>

          <div className="flex flex-col gap-1 border-y border-fd-border/60 py-2 font-mono text-[11px]">
            <div className="truncate text-fd-muted-foreground">
              <span className="text-fd-card-foreground">&lt;script</span>{' '}
              src=&quot;
              <span className="text-fd-primary">{activeSource.shortSrc}</span>
              &quot;
            </div>
            <div className="flex items-center justify-between text-[10px] text-fd-muted-foreground">
              <span>data-status=&quot;{status}&quot;</span>
              <span>async removeOnUnmount</span>
            </div>
          </div>

          <div className="flex items-center justify-between font-mono text-[10px] tabular-nums text-fd-muted-foreground">
            <span>
              {status === 'ready'
                ? 'window.confetti → fn()'
                : status === 'error'
                  ? 'onerror event fired'
                  : status === 'loading'
                    ? 'fetching script...'
                    : 'waiting for src'}
            </span>
            <span className="uppercase">{sourceKey}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={fireConfetti}
            disabled={status !== 'ready'}
            className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
          >
            <PartyPopper className="size-3" />
            Fire Confetti
          </button>

          <button
            type="button"
            onClick={() => setSourceKey('idle')}
            disabled={sourceKey === 'idle'}
            aria-label="Unload script"
            className="inline-flex size-6 items-center justify-center rounded-lg border bg-fd-muted/40 text-fd-muted-foreground transition-[transform,color,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground"
          >
            <RotateCcw className="size-3" />
          </button>
        </div>

        <div
          role="group"
          aria-label="Script source"
          className="relative grid grid-cols-3 rounded-lg border bg-fd-muted/50 p-0.5"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${sourceIndex * 100}%, 0, 0)`,
            }}
          />
          {SOURCES.map((item) => {
            const active = sourceKey === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setSourceKey(item.key)}
                className={`relative z-10 rounded-md px-2.5 py-0.5 font-mono text-[11px] font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                  active
                    ? 'text-fd-card-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
