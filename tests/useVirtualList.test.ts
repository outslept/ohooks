import { useVirtualList } from '@/hooks/useVirtualList';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useVirtualList', () => {
  let container: HTMLDivElement;
  const items = Array.from({ length: 100 }, (_, i) => `Item ${i}`);

  beforeEach(() => {
    container = document.createElement('div');
    container.style.height = '100px';
    container.style.overflow = 'auto';

    const inner = document.createElement('div');
    inner.style.height = '2000px';
    container.appendChild(inner);
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('computes visible virtual items, totalHeight, and scrolls to index', async () => {
    const { result } = await renderHook(() =>
      useVirtualList(items, {
        containerTarget: container,
        itemHeight: 20,
        overscan: 2,
      }),
    );

    expect(result.current.totalHeight).toBe(2000);
    expect(result.current.wrapperProps.style.height).toBe('2000px');
    expect(result.current.virtualItems[0]?.index).toBe(0);
    expect(result.current.virtualItems.length).toBeLessThan(15);

    act(() => {
      result.current.scrollToIndex(20);
      container.dispatchEvent(new Event('scroll'));
    });

    expect(container.scrollTop).toBe(400);
    expect(result.current.virtualItems[0]?.index).toBe(18);
  });
});
