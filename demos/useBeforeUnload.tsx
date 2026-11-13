'use client';

import { useState } from 'react';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';

export default function UseBeforeUnloadDemo() {
  const [draft, setDraft] = useState('Unsaved article draft');
  const [savedDraft, setSavedDraft] = useState('Unsaved article draft');
  const [lastCheck, setLastCheck] = useState<'blocked' | 'allowed' | null>(
    null,
  );

  const isDirty = draft !== savedDraft;
  useBeforeUnload(isDirty, 'You have unsaved changes.');

  const testUnloadGuard = () => {
    if (typeof window === 'undefined') return;
    const event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);
    setLastCheck(event.defaultPrevented ? 'blocked' : 'allowed');
  };

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

        <div
          className={`relative flex w-full max-w-xs flex-col gap-2.5 border bg-fd-card/85 p-3.5 shadow-2xs backdrop-blur-[2px] transition-colors duration-150 ease-out ${
            isDirty ? 'border-amber-500/40' : 'border-fd-primary/25'
          }`}
        >
          <span
            className={`pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 transition-opacity duration-150 ease-out ${
              isDirty ? 'border-amber-500' : 'border-fd-primary'
            }`}
            style={{ opacity: isDirty ? 1 : 0.4 }}
          />
          <span
            className={`pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 transition-opacity duration-150 ease-out ${
              isDirty ? 'border-amber-500' : 'border-fd-primary'
            }`}
            style={{ opacity: isDirty ? 1 : 0.4 }}
          />
          <span
            className={`pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 transition-opacity duration-150 ease-out ${
              isDirty ? 'border-amber-500' : 'border-fd-primary'
            }`}
            style={{ opacity: isDirty ? 1 : 0.4 }}
          />
          <span
            className={`pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 transition-opacity duration-150 ease-out ${
              isDirty ? 'border-amber-500' : 'border-fd-primary'
            }`}
            style={{ opacity: isDirty ? 1 : 0.4 }}
          />

          <div className="flex items-center justify-between font-mono text-[11px]">
            <div className="flex items-center gap-1.5">
              <span
                className={`size-1.5 rounded-full transition-colors duration-150 ease-out ${
                  isDirty ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
              <span className="font-semibold text-fd-foreground">
                {isDirty ? 'guard: active' : 'guard: idle'}
              </span>
            </div>

            {lastCheck && (
              <span
                key={`${lastCheck}-${String(isDirty)}`}
                className={`rounded px-1.5 py-0.2 text-[10px] font-semibold tracking-wider uppercase animate-in fade-in zoom-in-95 duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:animate-none ${
                  lastCheck === 'blocked'
                    ? 'bg-amber-500/15 text-amber-500'
                    : 'bg-emerald-500/15 text-emerald-500'
                }`}
              >
                {lastCheck}
              </span>
            )}
          </div>

          <input
            type="text"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setLastCheck(null);
            }}
            placeholder="Edit draft to arm guard..."
            aria-label="Draft content"
            className="w-full rounded-md border bg-fd-background/80 px-2.5 py-1.5 font-mono text-xs text-fd-foreground placeholder:text-fd-muted-foreground/60 focus:border-fd-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setSavedDraft(draft);
              setLastCheck(null);
            }}
            disabled={!isDirty}
            className="rounded-lg bg-fd-primary/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-fd-primary transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/20 motion-reduce:transition-none"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft(savedDraft);
              setLastCheck(null);
            }}
            disabled={!isDirty}
            className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 font-mono text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 motion-reduce:transition-none"
          >
            Discard
          </button>
        </div>

        <button
          type="button"
          onClick={testUnloadGuard}
          className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 font-mono text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 motion-reduce:transition-none"
        >
          Test beforeunload
        </button>
      </div>
    </div>
  );
}
