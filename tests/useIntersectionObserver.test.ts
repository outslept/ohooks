import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useIntersectionObserver', () => {
  let el: HTMLDivElement;

  beforeEach(() => {
    el = document.createElement('div');
    el.style.width = '50px';
    el.style.height = '50px';
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it('reports intersection entry for visible element and freezes when freezeOnceVisible is true', async () => {
    const onChange = vi.fn();

    const { result } = await renderHook(() =>
      useIntersectionObserver(el, { freezeOnceVisible: true, onChange }),
    );

    await vi.waitFor(() => {
      expect(result.current?.isIntersecting).toBe(true);
    });
    expect(onChange).toHaveBeenCalledOnce();
  });
});
