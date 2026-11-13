'use client';

import { useCookie } from '@/hooks/useCookie';

const COOKIE_NAME = 'demo_consent_tier';
const TIERS = ['essential', 'analytics', 'marketing'] as const;

export default function UseCookieDemo() {
  const [cookieValue, setCookieValue, deleteCookie] = useCookie(COOKIE_NAME, {
    defaultValue: null,
    path: '/',
    sameSite: 'lax',
  });

  const activeTierIdx = TIERS.indexOf(
    cookieValue as (typeof TIERS)[number],
  );
  const hasCookie = cookieValue !== null;

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

        <div className="relative flex w-64 flex-col gap-2 border border-fd-primary/25 bg-fd-card/85 px-4 py-3.5 shadow-2xs backdrop-blur-[2px]">
          <span
            className="pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: hasCookie ? 1 : 0.35 }}
          />
          <span
            className="pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: hasCookie ? 1 : 0.35 }}
          />
          <span
            className="pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: hasCookie ? 1 : 0.35 }}
          />
          <span
            className="pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150 ease-out"
            style={{ opacity: hasCookie ? 1 : 0.35 }}
          />

          <div className="flex items-center justify-between font-mono text-[10px]">
            <span className="text-fd-muted-foreground">{COOKIE_NAME}</span>
            <span
              className={`rounded px-1.5 py-0.2 font-semibold uppercase transition-colors duration-150 ease-out ${
                hasCookie
                  ? 'bg-emerald-500/15 text-emerald-500'
                  : 'bg-fd-muted text-fd-muted-foreground'
              }`}
            >
              {hasCookie ? 'persisted' : 'unset'}
            </span>
          </div>

          <div
            key={cookieValue ?? 'null'}
            className="truncate font-mono text-base font-semibold tracking-tight text-fd-foreground animate-in fade-in zoom-in-95 duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:animate-none"
          >
            {cookieValue ? `"${cookieValue}"` : 'null'}
          </div>

          <span className="truncate font-mono text-[10px] text-fd-muted-foreground">
            {hasCookie
              ? `${COOKIE_NAME}=${cookieValue}; path=/; samesite=lax`
              : 'max-age=0 (expired)'}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <button
          type="button"
          onClick={() => deleteCookie()}
          disabled={!hasCookie}
          className="rounded-lg border bg-fd-muted/40 px-2.5 py-1 font-mono text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/70 motion-reduce:transition-none"
        >
          Delete cookie
        </button>

        <div
          role="group"
          aria-label="Cookie consent tier"
          className="relative grid grid-cols-3 rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-md bg-fd-card shadow-2xs transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              opacity: activeTierIdx >= 0 ? 1 : 0,
              transform: `translate3d(${Math.max(0, activeTierIdx) * 100}%, 0, 0)`,
            }}
          />
          {TIERS.map((tier) => {
            const active = cookieValue === tier;
            return (
              <button
                key={tier}
                type="button"
                onClick={() => setCookieValue(tier)}
                className={`relative z-10 rounded-md px-2 py-0.5 font-mono text-[11px] font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                  active
                    ? 'text-fd-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-foreground'
                }`}
              >
                {tier}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
