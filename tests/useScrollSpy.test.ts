import { useScrollSpy } from '@/hooks/useScrollSpy';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

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

  it('identifies the topmost visible section across selector, id, ref, and element targets and updates when visibility changes', async () => {
    const s2Ref = { current: s2 };

    const { result, rerender } = await renderHook(
      (props?: { targets: readonly (string | { current: HTMLElement | null } | HTMLElement)[] }) =>
        useScrollSpy(props?.targets ?? ['sec-1', s2Ref], {
          rootMargin: '0px',
          threshold: [0, 0.5],
        }),
      { initialProps: { targets: ['sec-1', s2Ref] } }
    );

    await expect.poll(() => result.current).toBe('sec-1');


    s1.style.display = 'none';
    await expect.poll(() => result.current).toBe('sec-2');


    await rerender({ targets: [] });
    expect(result.current).toBeNull();
  });
});
