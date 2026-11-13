'use client';

import {
  type ColorSchemePreference,
  useDarkMode,
} from '@/hooks/useDarkMode';

const PREFERENCES: { value: ColorSchemePreference; label: string }[] = [
  { value: 'light', label: 'light' },
  { value: 'dark', label: 'dark' },
  { value: 'system', label: 'system' },
];

export default function UseDarkModeDemo() {
  const {
    isDarkMode,
    preference,
    toggle,
    enable,
    disable,
    resetToSystem,
  } = useDarkMode({
    storageKey: 'demo-dark-mode-pref',
    applyDarkClass: false,
  });

  const handleSelect = (next: ColorSchemePreference) => {
    if (next === 'light') disable();
    else if (next === 'dark') enable();
    else resetToSystem();
  };

  const activePrefIdx = Math.max(
    0,
    PREFERENCES.findIndex((p) => p.value === preference),
  );

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      <div
        className={`relative flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border transition-colors duration-200 ease-out motion-reduce:transition-none ${
          isDarkMode
            ? 'border-zinc-800 bg-zinc-950 text-zinc-100'
            : 'border-zinc-200 bg-zinc-50 text-zinc-900'
        }`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div
          className={`relative flex w-56 flex-col items-center justify-center gap-2 border px-4 py-3.5 shadow-2xs backdrop-blur-[2px] transition-colors duration-200 ease-out motion-reduce:transition-none ${
            isDarkMode
              ? 'border-indigo-400/35 bg-zinc-900/85'
              : 'border-amber-500/40 bg-white/85'
          }`}
        >
          <span
            className={`pointer-events-none absolute -top-px -left-px size-2 border-t-2 border-l-2 transition-colors duration-150 ease-out ${
              isDarkMode ? 'border-indigo-400' : 'border-amber-500'
            }`}
          />
          <span
            className={`pointer-events-none absolute -top-px -right-px size-2 border-t-2 border-r-2 transition-colors duration-150 ease-out ${
              isDarkMode ? 'border-indigo-400' : 'border-amber-500'
            }`}
          />
          <span
            className={`pointer-events-none absolute -bottom-px -left-px size-2 border-b-2 border-l-2 transition-colors duration-150 ease-out ${
              isDarkMode ? 'border-indigo-400' : 'border-amber-500'
            }`}
          />
          <span
            className={`pointer-events-none absolute -right-px -bottom-px size-2 border-r-2 border-b-2 transition-colors duration-150 ease-out ${
              isDarkMode ? 'border-indigo-400' : 'border-amber-500'
            }`}
          />

          <div className="flex items-center gap-2">
            <span
              className={`size-2 rounded-full transition-colors duration-150 ease-out ${
                isDarkMode ? 'bg-indigo-400' : 'bg-amber-500'
              }`}
            />
            <span className="font-mono text-base font-semibold tracking-tight">
              {isDarkMode ? 'dark' : 'light'}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] opacity-75">
            <span>pref: {preference}</span>
            <span>·</span>
            <span>isDark: {String(isDarkMode)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <button
          type="button"
          onClick={toggle}
          className="rounded-lg bg-fd-primary/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-fd-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/20 motion-reduce:transition-none"
        >
          Toggle
        </button>

        <div
          role="group"
          aria-label="Color scheme preference"
          className="relative grid grid-cols-3 rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activePrefIdx * 100}%, 0, 0)`,
            }}
          />
          {PREFERENCES.map((option) => {
            const active = preference === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`relative z-10 rounded-md px-2 py-0.5 font-mono text-[11px] font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
                  active
                    ? 'text-fd-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-foreground'
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
