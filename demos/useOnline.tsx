'use client';

import { useEffect, useRef, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useOnline } from '@/hooks/useOnline';

const MODES = [
  { id: 'system', label: 'System' },
  { id: 'online', label: 'Online' },
  { id: 'offline', label: 'Offline' },
] as const;

type ModeId = (typeof MODES)[number]['id'];

function applyOnlineMode(mode: ModeId) {
  if (typeof window === 'undefined') return;

  if (mode === 'system') {
    delete (window.navigator as { onLine?: boolean }).onLine;
    window.dispatchEvent(
      new Event(window.navigator.onLine ? 'online' : 'offline')
    );
  } else {
    const nextValue = mode === 'online';
    Object.defineProperty(window.navigator, 'onLine', {
      value: nextValue,
      configurable: true,
    });
    window.dispatchEvent(new Event(nextValue ? 'online' : 'offline'));
  }
}

export default function UseOnlineDemo() {
  const isOnline = useOnline();
  const [mode, setMode] = useState<ModeId>('system');
  const [transitions, setTransitions] = useState(0);
  const frameRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        delete (window.navigator as { onLine?: boolean }).onLine;
      }
    };
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setTransitions((count) => count + 1);

    if (
      typeof window !== 'undefined' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      frameRef.current?.animate(
        [
          { transform: 'scale3d(0.97, 0.97, 1)', opacity: 0.75 },
          { transform: 'scale3d(1, 1, 1)', opacity: 1 },
        ],
        { duration: 200, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
      );
    }
  }, [isOnline]);

  const selectMode = (nextMode: ModeId) => {
    setMode(nextMode);
    applyOnlineMode(nextMode);
  };

  const toggleConnection = () => {
    selectMode(isOnline ? 'offline' : 'online');
  };

  const activeModeIndex = MODES.findIndex((item) => item.id === mode);

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

        <div
          ref={frameRef}
          className="relative flex w-60 flex-col items-center justify-center gap-2 border border-fd-primary/25 bg-fd-card/70 px-5 py-3.5 shadow-2xs backdrop-blur-[2px]"
        >
          <span
            className=" -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: isOnline ? 1 : 0.35 }}
          />
          <span
            className=" -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: isOnline ? 1 : 0.35 }}
          />
          <span
            className=" -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: isOnline ? 1 : 0.35 }}
          />
          <span
            className=" -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: isOnline ? 1 : 0.35 }}
          />

          <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-wider text-fd-muted-foreground uppercase">
            <span
              className={`size-1.5 rounded-full transition-colors duration-150 ${
                isOnline ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
            <span>navigator.onLine</span>
          </div>

          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="size-4 text-emerald-500" />
            ) : (
              <WifiOff className="size-4 text-rose-500" />
            )}
            <span className="font-mono text-xl font-bold tracking-tight text-fd-foreground">
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>

          <div className="mt-0.5 flex w-full items-center justify-between border-t border-fd-border/60 pt-2 font-mono text-[11px] text-fd-muted-foreground tabular-nums">
            <span>value: {String(isOnline)}</span>
            <span>events: {transitions}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <button
          type="button"
          onClick={toggleConnection}
          className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
        >
          {isOnline ? (
            <WifiOff className="size-3.5" />
          ) : (
            <Wifi className="size-3.5" />
          )}
          {isOnline ? 'Go offline' : 'Go online'}
        </button>

        <div
          role="group"
          aria-label="Network state mode"
          className="relative grid grid-cols-3 items-center rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-0.25rem)/3)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeModeIndex * 100}%, 0, 0)`,
            }}
          />
          {MODES.map((item) => {
            const isSelected = mode === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectMode(item.id)}
                className={`relative z-10 px-2.5 py-0.5 font-mono text-[11px] font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] ${
                  isSelected
                    ? 'text-fd-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-foreground'
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
