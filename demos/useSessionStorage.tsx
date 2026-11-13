'use client';

import { RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useSessionStorage } from '@/hooks/useSessionStorage';

interface CheckoutDraft {
  step: number;
  coupon: string;
}

const STORAGE_KEY = 'fumadocs-demo-session-draft';
const STEPS = [1, 2, 3] as const;
const COUPON_PRESETS = ['REACT2025', 'SHIPFREE', 'VIP50'] as const;

export default function UseSessionStorageDemo() {
  const [draft, setDraft, removeDraft] = useSessionStorage<CheckoutDraft>(
    STORAGE_KEY,
    { step: 1, coupon: 'REACT2025' }
  );
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setHasStoredKey(window.sessionStorage.getItem(STORAGE_KEY) !== null);
    } catch {
      setHasStoredKey(false);
    }
  }, [draft]);

  const pulseFrame = () => {
    const el = frameRef.current;
    if (!el) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    el.animate(
      [
        { transform: 'scale3d(1.02, 1.02, 1)' },
        { transform: 'scale3d(1, 1, 1)' },
      ],
      { duration: 200, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
    );
  };

  const handleCycleCoupon = () => {
    const currentIndex = COUPON_PRESETS.indexOf(
      draft.coupon as (typeof COUPON_PRESETS)[number]
    );
    const nextCoupon =
      COUPON_PRESETS[(currentIndex + 1) % COUPON_PRESETS.length];
    setDraft((prev) => ({ ...prev, coupon: nextCoupon }));
    pulseFrame();
  };

  const handleRemove = () => {
    removeDraft();
    setHasStoredKey(false);
    pulseFrame();
  };

  const serialized = JSON.stringify(draft);
  const stepIndex = Math.max(
    0,
    STEPS.indexOf(draft.step as (typeof STEPS)[number])
  );

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
          className="relative flex w-80 max-w-[calc(100%-1.5rem)] flex-col gap-2.5 border border-fd-primary/25 bg-fd-card/70 p-3.5 shadow-2xs backdrop-blur-[2px]"
        >
          <span
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: hasStoredKey ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: hasStoredKey ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: hasStoredKey ? 1 : 0.45 }}
          />
          <span
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out motion-reduce:transition-none"
            style={{ opacity: hasStoredKey ? 1 : 0.45 }}
          />

          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wider uppercase text-fd-muted-foreground">
              <span
                className={`size-1.5 rounded-full transition-colors duration-150 ease-out ${
                  hasStoredKey ? 'bg-fd-primary' : 'bg-fd-muted-foreground/40'
                }`}
              />
              {hasStoredKey ? 'persisted in session' : 'initial fallback'}
            </span>
            <span className="font-mono text-[10px] tabular-nums text-fd-muted-foreground">
              {serialized.length}B
            </span>
          </div>

          <div className="flex items-center gap-2 border-y border-fd-border/60 py-2">
            <span className="shrink-0 font-mono text-[10px] font-medium tracking-wider uppercase text-fd-muted-foreground">
              coupon
            </span>
            <input
              type="text"
              value={draft.coupon}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, coupon: e.target.value }))
              }
              placeholder="PROMO"
              aria-label="Promo code"
              className="w-full border border-fd-border/70 bg-fd-background/90 px-2 py-1 font-mono text-xs text-fd-card-foreground focus:border-fd-primary/60 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between gap-2 font-mono text-[11px] tabular-nums">
            <span className="truncate text-fd-primary">{serialized}</span>
            <span className="shrink-0 text-[10px] text-fd-muted-foreground">
              step {draft.step}/3
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCycleCoupon}
            className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
          >
            <RefreshCw className="size-3" />
            Cycle Coupon
          </button>

          <button
            type="button"
            onClick={handleRemove}
            disabled={!hasStoredKey}
            className="inline-flex items-center gap-1 rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
          >
            <Trash2 className="size-3" />
            Remove Key
          </button>
        </div>

        <div
          role="group"
          aria-label="Wizard step"
          className="relative grid grid-cols-3 rounded-lg border bg-fd-muted/50 p-0.5"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${stepIndex * 100}%, 0, 0)`,
            }}
          />
          {STEPS.map((step) => {
            const active = draft.step === step;
            return (
              <button
                key={step}
                type="button"
                onClick={() => {
                  setDraft((prev) => ({ ...prev, step }));
                  pulseFrame();
                }}
                className={`relative z-10 rounded-md px-2 py-0.5 font-mono text-[11px] font-medium tabular-nums transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                  active
                    ? 'text-fd-card-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-card-foreground'
                }`}
              >
                Step {step}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
