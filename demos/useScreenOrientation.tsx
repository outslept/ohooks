'use client';

import { Lock, Smartphone, Unlock } from 'lucide-react';
import { useState } from 'react';
import { useScreenOrientation } from '@/hooks/useScreenOrientation';

const LOCK_TARGETS = ['portrait', 'landscape'] as const;
type LockTarget = (typeof LOCK_TARGETS)[number];

export default function UseScreenOrientationDemo() {
  const { type, angle, isSupported, lock, unlock } = useScreenOrientation();
  const [target, setTarget] = useState<LockTarget>('portrait');
  const [statusNote, setStatusNote] = useState<string>('ready');
  const [isLocked, setIsLocked] = useState(false);

  const handleLock = async (orientation: LockTarget = target) => {
    setTarget(orientation);
    try {
      await lock(orientation);
      setIsLocked(true);
      setStatusNote(`locked → ${orientation}`);
    } catch (err) {
      setIsLocked(false);
      const raw =
        err instanceof Error ? err.message : 'requires mobile fullscreen';
      setStatusNote(raw.replace(/^.*:\s*/, '').toLowerCase());
    }
  };

  const handleUnlock = () => {
    try {
      unlock();
      setIsLocked(false);
      setStatusNote('orientation unlocked');
    } catch (err) {
      setStatusNote(err instanceof Error ? err.message : 'unlock failed');
    }
  };

  const targetIndex = LOCK_TARGETS.indexOf(target);

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

        <div className="relative flex w-72 max-w-[calc(100%-1.5rem)] flex-col gap-2.5 border border-fd-primary/25 bg-fd-card/70 p-3.5 shadow-2xs backdrop-blur-[2px]">
          <span
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isSupported ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isSupported ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isSupported ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: isSupported ? 1 : 0.45 }}
          />

          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wider uppercase text-fd-muted-foreground">
              <span
                className={`size-1.5 rounded-full transition-colors duration-150 ease-out ${
                  isSupported ? 'bg-fd-primary' : 'bg-fd-muted-foreground/40'
                }`}
              />
              {isSupported ? 'screen.orientation' : 'fallback'}
            </span>
            <span className="font-mono text-[10px] font-semibold tabular-nums text-fd-primary">
              {angle}°
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 border-y border-fd-border/60 py-2.5">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center border border-fd-primary/30 bg-fd-primary/10 text-fd-primary">
                <Smartphone
                  className="size-4 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
                  style={{
                    transform: `rotate3d(0, 0, 1, ${angle}deg)`,
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-medium tracking-wider uppercase text-fd-muted-foreground">
                  Type
                </span>
                <span className="font-mono text-xs font-semibold text-fd-card-foreground">
                  {type || 'unknown'}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[10px] font-medium tracking-wider uppercase text-fd-muted-foreground">
                Angle
              </span>
              <span className="font-mono text-sm font-bold tabular-nums text-fd-primary">
                {angle} deg
              </span>
            </div>
          </div>

          <div className="truncate font-mono text-[10px] text-fd-muted-foreground">
            status: <span className="text-fd-card-foreground">{statusNote}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleLock(target)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
          >
            <Lock className="size-3" />
            Lock {target}
          </button>

          <button
            type="button"
            onClick={handleUnlock}
            className="inline-flex items-center gap-1 rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            <Unlock className="size-3" />
            {isLocked ? 'Unlock' : 'Release'}
          </button>
        </div>

        <div
          role="group"
          aria-label="Target lock orientation"
          className="relative grid grid-cols-2 rounded-lg border bg-fd-muted/50 p-0.5"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${targetIndex * 100}%, 0, 0)`,
            }}
          />
          {LOCK_TARGETS.map((mode) => {
            const active = target === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => handleLock(mode)}
                className={`relative z-10 rounded-md px-2.5 py-0.5 font-mono text-[11px] font-medium capitalize transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                  active
                    ? 'text-fd-card-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground'
                }`}
              >
                {mode}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
