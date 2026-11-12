import { useElementSize } from '@/hooks/useElementSize';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useElementSize', () => {
  let el: HTMLDivElement;

  beforeEach(() => {
    el = document.createElement('div');
    el.style.boxSizing = 'border-box';
    el.style.width = '140px';
    el.style.height = '80px';
    el.style.padding = '10px';
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it('measures content-box and border-box dimensions and updates on resize', async () => {
    const { result, rerender } = await renderHook(
      (box: ResizeObserverBoxOptions = 'content-box') =>
        useElementSize(el, { box }),
    );

    await vi.waitFor(() => {
      expect(result.current).toEqual({ width: 120, height: 60 });
    });

    await rerender('border-box');
    await vi.waitFor(() => {
      expect(result.current).toEqual({ width: 140, height: 80 });
    });

    el.style.width = '200px';
    await vi.waitFor(() => {
      expect(result.current).toEqual({ width: 200, height: 80 });
    });
  });
});
