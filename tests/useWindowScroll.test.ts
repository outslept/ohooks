import { useWindowScroll } from '@/hooks/useWindowScroll';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useWindowScroll', () => {
  let spacer: HTMLDivElement;

  beforeEach(() => {
    spacer = document.createElement('div');
    spacer.style.height = '3000px';
    spacer.style.width = '3000px';
    document.body.appendChild(spacer);
    window.scrollTo(0, 0);
  });

  afterEach(() => {
    window.scrollTo(0, 0);
    spacer.remove();
  });

  it('tracks window scroll coordinates and scrolls via scrollTo helper', async () => {
    const { result } = await renderHook(() => useWindowScroll());
    expect(result.current.x).toBe(0);
    expect(result.current.y).toBe(0);

    act(() => {
      result.current.scrollTo(40, 120);
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.x).toBe(40);
    expect(result.current.y).toBe(120);

    act(() => {
      result.current.scrollTo({ top: 0, left: 0 });
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.x).toBe(0);
    expect(result.current.y).toBe(0);
  });
});
