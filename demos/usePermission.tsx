'use client';

import { useEffect, useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import {
  usePermission,
  type ExtendedPermissionName,
  type UsePermissionState,
} from '@/hooks/usePermission';

const PERMISSIONS: readonly {
  id: ExtendedPermissionName;
  label: string;
}[] = [
  { id: 'geolocation', label: 'geo' },
  { id: 'notifications', label: 'notify' },
  { id: 'camera', label: 'camera' },
  { id: 'microphone', label: 'mic' },
];

const STATUS_STYLES: Record<
  UsePermissionState,
  { dot: string; badge: string }
> = {
  granted: {
    dot: 'bg-emerald-500',
    badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
  },
  prompt: {
    dot: 'bg-amber-500',
    badge: 'border-amber-500/30 bg-amber-500/10 text-amber-500',
  },
  denied: {
    dot: 'bg-rose-500',
    badge: 'border-rose-500/30 bg-rose-500/10 text-rose-500',
  },
  loading: {
    dot: 'bg-fd-primary',
    badge: 'border-fd-primary/30 bg-fd-primary/10 text-fd-primary',
  },
  unsupported: {
    dot: 'bg-fd-muted-foreground/50',
    badge: 'border-fd-border bg-fd-muted/50 text-fd-muted-foreground',
  },
};

export default function UsePermissionDemo() {
  const [selected, setSelected] =
    useState<ExtendedPermissionName>('geolocation');
  const [isRequesting, setIsRequesting] = useState(false);
  const status = usePermission(selected);
  const frameRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

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
        { duration: 200, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
      );
    }
  }, [selected, status]);

  const requestPermission = async () => {
    if (typeof window === 'undefined' || isRequesting) return;
    setIsRequesting(true);

    try {
      if (selected === 'geolocation' && 'geolocation' in navigator) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve(),
            () => resolve(),
            { timeout: 4000 }
          );
        });
      } else if (selected === 'notifications' && 'Notification' in window) {
        await Notification.requestPermission();
      } else if (
        (selected === 'camera' || selected === 'microphone') &&
        navigator.mediaDevices?.getUserMedia
      ) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: selected === 'camera',
          audio: selected === 'microphone',
        });
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch {
      // Ignored when denied or dismissed by user
    } finally {
      setIsRequesting(false);
    }
  };

  const activeIndex = PERMISSIONS.findIndex((item) => item.id === selected);
  const style = STATUS_STYLES[status];

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
          className="relative flex w-64 flex-col items-center justify-center gap-2.5 border border-fd-primary/25 bg-fd-card/70 px-5 py-4 shadow-2xs backdrop-blur-[2px]"
        >
          <span
            className=" -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: status === 'granted' ? 1 : 0.45 }}
          />
          <span
            className=" -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: status === 'granted' ? 1 : 0.45 }}
          />
          <span
            className=" -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: status === 'granted' ? 1 : 0.45 }}
          />
          <span
            className=" -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: status === 'granted' ? 1 : 0.45 }}
          />

          <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-wider text-fd-muted-foreground uppercase">
            <span className={`size-1.5 rounded-full ${style.dot}`} />
            <span>permissions.query</span>
          </div>

          <span className="font-mono text-lg font-bold tracking-tight text-fd-foreground">
            {selected}
          </span>

          <span
            className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wide uppercase ${style.badge}`}
          >
            {status}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <button
          type="button"
          onClick={requestPermission}
          disabled={isRequesting || status === 'unsupported'}
          className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
        >
          <ShieldCheck className="size-3.5" />
          {isRequesting ? 'Requesting...' : 'Request access'}
        </button>

        <div
          role="group"
          aria-label="Permission descriptor"
          className="relative grid grid-cols-4 items-center rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-0.25rem)/4)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeIndex * 100}%, 0, 0)`,
            }}
          />
          {PERMISSIONS.map((item) => {
            const isSelected = selected === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelected(item.id)}
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
