'use client';

import { useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import {
  usePointerDrag,
  type PointerDragAxis,
} from '@/hooks/usePointerDrag';

const AXES: readonly PointerDragAxis[] = ['both', 'x', 'y'];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export default function UsePointerDragDemo() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [axis, setAxis] = useState<PointerDragAxis>('both');
  const [isCleared, setIsCleared] = useState(false);

  const { isDragging, deltaX, deltaY, movementX, movementY } = usePointerDrag(
    boxRef,
    {
      axis,
      preventDefault: true,
      onDragStart: () => {
        setIsCleared(false);
      },
    }
  );

  const displayDeltaX = isCleared && !isDragging ? 0 : Math.round(deltaX);
  const displayDeltaY = isCleared && !isDragging ? 0 : Math.round(deltaY);
  const displayMoveX = isDragging ? Math.round(movementX) : 0;
  const displayMoveY = isDragging ? Math.round(movementY) : 0;

  const visualX = isDragging ? clamp(deltaX, -88, 88) : 0;
  const visualY = isDragging ? clamp(deltaY, -36, 36) : 0;

  const activeAxisIndex = AXES.indexOf(axis);

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
          ref={boxRef}
          style={{
            transform: `translate3d(${visualX}px, ${visualY}px, 0)`,
            touchAction: 'none',
          }}
          className={`relative flex w-56 select-none flex-col items-center justify-center gap-1.5 border bg-fd-card/70 px-4 py-3 shadow-2xs backdrop-blur-[2px] ${
            isDragging
              ? 'cursor-grabbing border-fd-primary/50 transition-none'
              : 'cursor-grab border-fd-primary/25 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none'
          }`}
        >
          <span
            className=" -top-px -left-px size-2 border-t-2 border-l-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: isDragging ? 1 : 0.45 }}
          />
          <span
            className=" -top-px -right-px size-2 border-t-2 border-r-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: isDragging ? 1 : 0.45 }}
          />
          <span
            className=" -bottom-px -left-px size-2 border-b-2 border-l-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: isDragging ? 1 : 0.45 }}
          />
          <span
            className=" -right-px -bottom-px size-2 border-r-2 border-b-2 border-fd-primary transition-opacity duration-150"
            style={{ opacity: isDragging ? 1 : 0.45 }}
          />

          <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-wider text-fd-muted-foreground uppercase">
            <span
              className={`size-1.5 rounded-full transition-colors duration-150 ${
                isDragging ? 'bg-fd-primary' : 'bg-fd-muted-foreground/50'
              }`}
            />
            <span>{isDragging ? 'Dragging' : 'Drag frame'}</span>
          </div>

          <div className="flex items-baseline gap-3 font-mono text-lg font-bold tracking-tight text-fd-foreground tabular-nums">
            <span>
              <span className="mr-1 text-xs font-normal text-fd-muted-foreground">
                Δx
              </span>
              {displayDeltaX}px
            </span>
            <span className="text-fd-border">/</span>
            <span>
              <span className="mr-1 text-xs font-normal text-fd-muted-foreground">
                Δy
              </span>
              {displayDeltaY}px
            </span>
          </div>

          <div className="font-mono text-[11px] text-fd-muted-foreground tabular-nums">
            v: ({displayMoveX}, {displayMoveY}) px/frame
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs">
        <button
          type="button"
          onClick={() => setIsCleared(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border bg-fd-muted/40 px-2.5 py-1 text-[11px] font-medium text-fd-card-foreground transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fd-muted"
        >
          <RotateCcw className="size-3 text-fd-muted-foreground" />
          Reset
        </button>

        <div
          role="group"
          aria-label="Drag axis"
          className="relative grid grid-cols-3 items-center rounded-lg border bg-fd-muted/40 p-0.5"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-0.25rem)/3)] rounded-md bg-fd-card shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            style={{
              transform: `translate3d(${activeAxisIndex * 100}%, 0, 0)`,
            }}
          />
          {AXES.map((item) => {
            const isSelected = axis === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setAxis(item);
                  setIsCleared(true);
                }}
                className={`relative z-10 px-2.5 py-0.5 font-mono text-[11px] font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] ${
                  isSelected
                    ? 'text-fd-foreground'
                    : 'text-fd-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-fd-foreground'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
