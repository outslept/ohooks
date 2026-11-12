import { useScrollSpy } from '@/hooks/useScrollSpy';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useScrollSpy', () => {
  let s1: HTMLElement;
  let s2: HTMLElement;

  beforeEach(() => {
    s1 = document.createElement('section');
    s1.id = 'sec-1';
    s1.style.height = '60px';

    s2 = document.createElement('section');
    s2.id = 'sec-2';
    s2.style.height = '60px';

    document.body.append(s1, s2);
  });

  afterEach(() => {
    s1.remove();
    s2.remove();
  });

  it('identifies the topmost visible section id', async () => {
    const { result } = await renderHook(() =>
      useScrollSpy(['#sec-1', '#sec-2'], { rootMargin: '0px' }),
    );

    await vi.waitFor(() => {
      expect(result.current).toBe('sec-1');
    });
  });
});
