'use client';

import { RotateCcw } from 'lucide-react';
import { type ReactNode, Suspense, useRef, useState } from 'react';

export function HookPreviewFrame({ children }: { children: ReactNode }) {
  const [replayKey, setReplayKey] = useState(0);
  const iconRef = useRef<SVGSVGElement>(null);

  const handleReset = () => {
    setReplayKey((k) => k + 1);

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!reduced) {
      iconRef.current?.animate(
        [
          { transform: 'rotate3d(0, 0, 1, -180deg)' },
          { transform: 'rotate3d(0, 0, 1, 0deg)' },
        ],
        {
          duration: 220,
          easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
        },
      );
    }
  };

  return (
    <div className="relative flex min-h-[300px] w-full items-center justify-center rounded-lg border bg-fd-background px-4 py-10 md:px-10">
      <button
        type="button"
        onClick={handleReset}
        title="Reset demo"
        aria-label="Reset demo"
        className=" no-underline absolute top-2.5 right-2.5 z-10 inline-flex size-7 items-center justify-center rounded-md border bg-fd-muted/40 text-fd-muted-foreground transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted/80 [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-foreground motion-reduce:transition-none"
      >
        <RotateCcw ref={iconRef} className="size-3.5" />
      </button>

      <div
        key={replayKey}
        className={`flex w-full max-w-md flex-col items-center justify-center ${
          replayKey > 0
            ? 'animate-in fade-in zoom-in-95 duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:animate-none'
            : ''
        }`}
      >
        <Suspense
          fallback={
            <div className="h-[238px] w-full rounded-xl border bg-fd-card/50" />
          }
        >
          {children}
        </Suspense>
      </div>
    </div>
  );
}
