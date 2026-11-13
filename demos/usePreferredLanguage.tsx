'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Languages } from 'lucide-react';
import { usePreferredLanguage } from '@/hooks/usePreferredLanguage';

const MODES = [
  { id: 'system', label: 'System' },
  { id: 'en-US', label: 'en-US' },
  { id: 'de-DE', label: 'de-DE' },
  { id: 'ja-JP', label: 'ja-JP' },
] as const;

type ModeId = (typeof MODES)[number]['id'];

const REFERENCE_DATE = new Date(Date.UTC(2025, 3, 15, 12, 0, 0));

function applyBrowserLanguage(locale: ModeId) {
  if (typeof window === 'undefined') return;

  if (locale === 'system') {
    delete (window.navigator as { language?: string }).language;
  } else {
    Object.defineProperty(window.navigator, 'language', {
      value: locale,
      configurable: true,
    });
  }

  window.dispatchEvent(new Event('languagechange'));
}

export default function UsePreferredLanguageDemo() {
  const language = usePreferredLanguage('en-US');
  const [mode, setMode] = useState<ModeId>('system');
  const frameRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        delete (window.navigator as { language?: string }).language;
        window.dispatchEvent(new Event('languagechange'));
      }
    };
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (
      typeof window !== 'undefined' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      frameRef.current?.animate(
        [
          { transform: 'scale3d(0.97, 0.97, 1)', opacity: 0.75 },
          { transform: 'scale3d(1, 1, 1)', opacity: 1 },
        ],
        { duration: 220, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
      );
    }
  }, [language]);

  const selectMode = (nextMode: ModeId) => {
    setMode(nextMode);
    applyBrowserLanguage(nextMode);
  };

  const cycleMode = () => {
    const currentIndex = MODES.findIndex((item) => item.id === mode);
    const nextItem = MODES[(currentIndex + 1) % MODES.length];
    selectMode(nextItem.id);
  };

  const formatted = useMemo(() => {
    try {
      const displayNames = new Intl.DisplayNames([language], {
        type: 'language',
      });
      const date = new Intl.DateTimeFormat(language, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(REFERENCE_DATE);
      const number = new Intl.NumberFormat(language, {
        maximumFractionDigits: 2,
      }).format(12840.5);

      return {
        name: displayNames.of(language) ?? language,
        date,
        number,
      };
    } catch {
      return {
        name: language,
        date: '2025-04-15',
        number: '12,840.5',
      };
    }
  }, [language]);

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
          className="relative flex w-64 flex-col items-center justify-center gap-2 border border-fd-primary/25 bg-fd-card/70 px-5 py-3.5 shadow-2xs backdrop-blur-[2px]"
        >
          <span className=" -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary" />
          <span className=" -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary" />
          <span className=" -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary" />
          <span className=" -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary" />

          <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-wider text-fd-muted-foreground uppercase">
            <span className="size-1.5 rounded-full bg-fd-primary" />
            <span>navigator.language</span>
          </div>

          <span className="font-mono text-2xl font-bold tracking-tight text-fd-foreground tabular-nums">
            {language}
          </span>

          <span className="max-w-full truncate text-[11px] font-medium text-fd-muted-foreground">
            {formatted.name}
          </span>

          <div className="mt-0.5 flex w-full items-center justify-between border-t border-fd-border/60 pt-2 font-mono text-[11px] text-fd-muted-foreground tabular-nums">
            <span>{formatted.date}</span>
            <span className="text-fd-foreground">{formatted.number}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <button
          type="button"
          onClick={cycleMode}
          className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
        >
          <Languages className="size-3.5" />
          Cycle locale
        </button>

        <div
          role="group"
          aria-label="Preferred language"
          className="relative grid grid-cols-4 items-center rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-0.25rem)/4)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
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
                className={`relative z-10 px-2 py-0.5 font-mono text-[11px] font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] ${
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
