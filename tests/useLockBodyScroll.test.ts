import {
  useLockBodyScroll,
  type UseLockBodyScrollOptions,
} from '@/hooks/useLockBodyScroll';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe('useLockBodyScroll', () => {
  beforeEach(() => {
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '';
  });

  it('locks body overflow with reference counting across instances and unlocks when locked becomes false', async () => {
    const { rerender: rerender1, unmount: unmount1 } = await renderHook(
      (props?: { locked: boolean }) => useLockBodyScroll(props?.locked ?? true),
      { initialProps: { locked: true } }
    );
    const { unmount: unmount2 } = await renderHook(() =>
      useLockBodyScroll(true)
    );

    expect(document.body.style.overflow).toBe('hidden');

    await rerender1({ locked: false });
    expect(document.body.style.overflow).toBe('hidden');

    await unmount2();
    expect(document.body.style.overflow).toBe('auto');

    await unmount1();
  });

  it('compensates scrollbar gap on custom target when reserveScrollBarGap is true and restores paddingRight on cleanup', async () => {
    const container = document.createElement('div');
    container.style.boxSizing = 'border-box';
    container.style.width = '200px';
    container.style.borderLeft = '10px solid black';
    container.style.borderRight = '10px solid black';
    container.style.paddingRight = '5px';
    container.style.overflow = 'scroll';
    document.body.appendChild(container);


    const { rerender, unmount } = await renderHook(
      (props?: UseLockBodyScrollOptions) =>
        useLockBodyScroll(true, { target: container, ...props }),
      { initialProps: { reserveScrollBarGap: true } }
    );

    expect(container.style.overflow).toBe('hidden');
    expect(container.style.paddingRight).toBe('25px');

    await rerender({ reserveScrollBarGap: false });
    expect(container.style.overflow).toBe('hidden');
    expect(container.style.paddingRight).toBe('5px');

    await unmount();
    expect(container.style.overflow).toBe('scroll');
    expect(container.style.paddingRight).toBe('5px');

    container.remove();
  });
});
