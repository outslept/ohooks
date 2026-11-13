'use client';

import { useEffect, useRef, useState } from 'react';
import { DatabaseZap } from 'lucide-react';
import {
  useNetworkInformation,
  type EffectiveConnectionType,
} from '@/hooks/useNetworkInformation';

interface ProfilePreset {
  id: 'system' | EffectiveConnectionType;
  label: string;
  effectiveType?: EffectiveConnectionType;
  downlink?: number;
  rtt?: number;
}

const PROFILES: readonly ProfilePreset[] = [
  { id: 'system', label: 'System' },
  { id: '4g', label: '4g', effectiveType: '4g', downlink: 10, rtt: 50 },
  { id: '3g', label: '3g', effectiveType: '3g', downlink: 1.6, rtt: 300 },
  {
    id: 'slow-2g',
    label: '2g',
    effectiveType: 'slow-2g',
    downlink: 0.4,
    rtt: 1200,
  },
];

type ProfileId = (typeof PROFILES)[number]['id'];

function syncNavigatorConnection(
  profileId: ProfileId,
  saveDataOverride: boolean | null
) {
  if (typeof window === 'undefined') return;

  delete (window.navigator as { connection?: unknown }).connection;
  const nativeConn = (
    window.navigator as Navigator & {
      connection?: {
        downlink?: number;
        downlinkMax?: number;
        effectiveType?: EffectiveConnectionType;
        rtt?: number;
        saveData?: boolean;
        type?: string;
      };
    }
  ).connection;

  if (profileId === 'system' && saveDataOverride === null) {
    window.dispatchEvent(
      new Event(window.navigator.onLine ? 'online' : 'offline')
    );
    return;
  }

  const preset = PROFILES.find((item) => item.id === profileId);
  const mockTarget = new EventTarget();

  Object.assign(mockTarget, {
    effectiveType:
      profileId === 'system'
        ? (nativeConn?.effectiveType ?? '4g')
        : preset?.effectiveType,
    downlink:
      profileId === 'system'
        ? (nativeConn?.downlink ?? 10)
        : preset?.downlink,
    downlinkMax: nativeConn?.downlinkMax,
    rtt: profileId === 'system' ? (nativeConn?.rtt ?? 50) : preset?.rtt,
    saveData:
      saveDataOverride !== null
        ? saveDataOverride
        : Boolean(nativeConn?.saveData),
    type: nativeConn?.type ?? 'wifi',
  });

  Object.defineProperty(window.navigator, 'connection', {
    value: mockTarget,
    configurable: true,
  });

  window.dispatchEvent(
    new Event(window.navigator.onLine ? 'online' : 'offline')
  );
}

export default function UseNetworkInformationDemo() {
  const { isOnline, isSupported, effectiveType, downlink, rtt, saveData } =
    useNetworkInformation();
  const [profile, setProfile] = useState<ProfileId>('system');
  const [saveDataOverride, setSaveDataOverride] = useState<boolean | null>(
    null
  );
  const frameRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        delete (window.navigator as { connection?: unknown }).connection;
        window.dispatchEvent(
          new Event(window.navigator.onLine ? 'online' : 'offline')
        );
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
        { duration: 200, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
      );
    }
  }, [effectiveType, downlink, rtt, saveData, isOnline]);

  const handleSelectProfile = (nextProfile: ProfileId) => {
    const nextSaveData = nextProfile === 'system' ? null : saveDataOverride;
    setProfile(nextProfile);
    setSaveDataOverride(nextSaveData);
    syncNavigatorConnection(nextProfile, nextSaveData);
  };

  const handleToggleSaveData = () => {
    const nextSaveData = !Boolean(saveData);
    const nextProfile = profile === 'system' && !isSupported ? '4g' : profile;
    setProfile(nextProfile);
    setSaveDataOverride(nextSaveData);
    syncNavigatorConnection(nextProfile, nextSaveData);
  };

  const activeProfileIndex = PROFILES.findIndex((item) => item.id === profile);

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
                !isOnline
                  ? 'bg-rose-500'
                  : isSupported
                    ? 'bg-emerald-500'
                    : 'bg-amber-500'
              }`}
            />
            <span>
              {!isOnline
                ? 'offline'
                : isSupported
                  ? 'navigator.connection'
                  : 'connection unsupported'}
            </span>
          </div>

          <div className="flex items-baseline gap-2.5 font-mono tabular-nums">
            <span className="text-2xl font-bold tracking-tight text-fd-foreground uppercase">
              {effectiveType ?? 'N/A'}
            </span>
            <span className="text-xs font-medium text-fd-muted-foreground">
              {downlink !== undefined ? `${downlink} Mbps` : '— Mbps'}
            </span>
          </div>

          <div className="mt-0.5 flex w-full items-center justify-between border-t border-fd-border/60 pt-2 font-mono text-[11px] text-fd-muted-foreground tabular-nums">
            <span>
              rtt:{' '}
              <span className="text-fd-foreground">
                {rtt !== undefined ? `${rtt}ms` : '—'}
              </span>
            </span>
            <span>
              saveData:{' '}
              <span
                className={
                  saveData ? 'font-semibold text-fd-primary' : 'text-fd-foreground'
                }
              >
                {saveData !== undefined ? String(saveData) : '—'}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <button
          type="button"
          onClick={handleToggleSaveData}
          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.97] ${
            saveData
              ? 'bg-fd-primary/15 text-fd-primary [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/20'
              : 'border bg-fd-muted/40 font-medium text-fd-card-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted'
          }`}
        >
          <DatabaseZap className="size-3.5" />
          Save-Data: {saveData ? 'on' : 'off'}
        </button>

        <div
          role="group"
          aria-label="Network profile"
          className="relative grid grid-cols-4 items-center rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-0.25rem)/4)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeProfileIndex * 100}%, 0, 0)`,
            }}
          />
          {PROFILES.map((item) => {
            const isSelected = profile === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectProfile(item.id)}
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
