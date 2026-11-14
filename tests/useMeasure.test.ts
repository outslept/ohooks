import { useMeasure } from '@/hooks/useMeasure';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useMeasure', () => {
  let el: HTMLDivElement;

  beforeEach(() => {
    el = document.createElement('div');
    el.style.width = '150px';
    el.style.height = '90px';
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it('measures attached element via ref callback and tracks resize updates', async () => {
    const { result, act } = await renderHook(() => useMeasure<HTMLDivElement>());
    expect(result.current[1].width).toBe(0);

    await act(async () => {
      result.current[0](el);
    });

    await vi.waitFor(() => {
      expect(result.current[1].width).toBe(150);
      expect(result.current[1].height).toBe(90);
      expect(result.current[1].right).toBe(150);
      expect(result.current[1].bottom).toBe(90);
    });

    el.style.height = '130px';
    await vi.waitFor(() => {
      expect(result.current[1].height).toBe(130);
    });
  });
});
