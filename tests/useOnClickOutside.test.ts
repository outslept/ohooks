import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

describe('useOnClickOutside', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('triggers handler only when clicking outside single or multiple targets', async () => {
    const inside1 = document.createElement('div');
    const child1 = document.createElement('span');
    inside1.appendChild(child1);

    const inside2 = document.createElement('div');
    const outside = document.createElement('button');

    document.body.append(inside1, inside2, outside);

    const handler = vi.fn();
    await renderHook(() => useOnClickOutside([inside1, { current: inside2 }], handler));

    child1.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    inside2.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(handler).not.toHaveBeenCalled();

    outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('respects enabled option, custom events, and ignores disconnected targets', async () => {
    const target = document.createElement('div');
    const outside = document.createElement('div');
    document.body.append(target, outside);

    const handler = vi.fn();
    const { rerender } = await renderHook((enabled: boolean = false) =>
      useOnClickOutside(target, handler, {
        enabled,
        events: ['mousedown'],
        capture: false,
      })
    );

    outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(handler).not.toHaveBeenCalled();

    await rerender(true);
    outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(handler).toHaveBeenCalledTimes(1);

    const detached = document.createElement('div');
    detached.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
