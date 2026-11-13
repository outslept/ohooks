'use client';

import { useRef, useState } from 'react';
import { Crosshair } from 'lucide-react';
import { useMouse } from '@/hooks/useMouse';

const SPACES = [
  { id: 'element', label: 'element' },
  { id: 'client', label: 'client' },
  { id: 'page', label: 'page' },
  { id: 'screen', label: 'screen' },
] as const;

type SpaceId = (typeof SPACES)[number]['id'];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export default function UseMouseDemo() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [space, setSpace] = useState<SpaceId>('element');
  const [isInside, setIsInside] = useState(false);

  const {
    x,
    y,
    clientX,
    clientY,
    screenX,
    screenY,
    elementX,
    elementY,
    elementPositionX,
    elementPositionY,
  } = useMouse(stageRef);

  const hasMoved = clientX !== 0 || clientY !== 0 || x !== 0 || y !== 0;

  let offsetX = 0;
  let offsetY = 0;

  if (hasMoved && stageRef.current) {
    const rect = stageRef.current.getBoundingClientRect();
    const rawDx = (elementX - rect.width / 2) * 0.22;
    const rawDy = (elementY - rect.height / 2) * 0.22;
    offsetX = clamp(rawDx, -52, 52);
    offsetY = clamp(rawDy, -22, 22);
  }

  const coords =
    space === 'element'
      ? { x: Math.round(elementX), y: Math.round(elementY), prefix: 'el' }
      : space === 'client'
        ? { x: Math.round(clientX), y: Math.round(clientY), prefix: 'vp' }
        : space === 'page'
          ? { x: Math.round(x), y: Math.round(y), prefix: 'doc' }
          : { x: Math.round(screenX), y: Math.round(screenY), prefix: 'scr' };

  const triggerSamplePoint = () => {
    if (typeof window === 'undefined' || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const randX = Math.round(rect.left + rect.width * (0.2 + Math.random() * 0.6));
    const randY = Math.round(rect.top + rect.height * (0.2 + Math.random() * 0.6));

    const synthetic = new MouseEvent('mousemove', {
      bubbles: true,
      clientX: randX,
      clientY: randY,
      screenX: randX,
      screenY: randY,
    });
    window.dispatchEvent(synthetic);
  };

  const activeSpaceIndex = SPACES.findIndex((item) => item.id === space);

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border bg-fd-card p-4 text-fd-card-foreground shadow-xs">
      <div
        ref={stageRef}
        onPointerEnter={() => setIsInside(true)}
        onPointerLeave={() => setIsInside(false)}
        className="relative flex h-44 w-full cursor-crosshair items-center justify-center overflow-hidden rounded-lg border bg-fd-muted/30 select-none"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div
          style={{
            transform: `translate3d(${offsetX}px, ${offsetY}px, 0)`,
          }}
          className="relative flex w-60 flex-col items-center justify-center gap-1.5 border border-fd-primary/25 bg-fd-card/70 px-5 py-3 shadow-2xs backdrop-blur-[2px]"
        >
          <span
            className=" -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: isInside ? 1 : 0.45 }}
          />
          <span
            className=" -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: isInside ? 1 : 0.45 }}
          />
          <span
            className=" -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: isInside ? 1 : 0.45 }}
          />
          <span
            className=" -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: isInside ? 1 : 0.45 }}
          />

          <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-wider text-fd-muted-foreground uppercase">
            <span
              className={`size-1.5 rounded-full transition-colors duration-150 ${
                isInside ? 'bg-fd-primary' : 'bg-fd-muted-foreground/50'
              }`}
            />
            <span>{space} coordinates</span>
          </div>

          <div className="flex items-baseline gap-3 font-mono text-lg font-bold tracking-tight text-fd-foreground tabular-nums">
            <span>
              <span className="mr-1 text-xs font-normal text-fd-muted-foreground">
                {coords.prefix}X
              </span>
              {coords.x}
            </span>
            <span className="text-fd-border">/</span>
            <span>
              <span className="mr-1 text-xs font-normal text-fd-muted-foreground">
                {coords.prefix}Y
              </span>
              {coords.y}
            </span>
          </div>

          <div className="font-mono text-[11px] text-fd-muted-foreground tabular-nums">
            origin: ({Math.round(elementPositionX)},{' '}
            {Math.round(elementPositionY)})
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <button
          type="button"
          onClick={triggerSamplePoint}
          className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary/10 px-2.5 py-1 text-[11px] font-semibold text-fd-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-primary/15"
        >
          <Crosshair className="size-3.5" />
          Sample point
        </button>

        <div
          role="group"
          aria-label="Coordinate space"
          className="relative grid grid-cols-4 items-center rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-0.25rem)/4)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeSpaceIndex * 100}%, 0, 0)`,
            }}
          />
          {SPACES.map((item) => {
            const isSelected = space === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSpace(item.id)}
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
