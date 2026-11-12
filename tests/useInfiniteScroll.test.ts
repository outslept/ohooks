import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useInfiniteScroll', () => {
  let sentinel: HTMLDivElement;

  beforeEach(() => {
    sentinel = document.createElement('div');
    sentinel.style.width = '20px';
    sentinel.style.height = '20px';
    document.body.appendChild(sentinel);
  });

  afterEach(() => {
    sentinel.remove();
  });

  it('triggers onLoadMore when sentinel intersects and stops when hasMore is false', async () => {
    const onLoadMore = vi.fn(
      () => new Promise<void>((resolve) => setTimeout(resolve, 20)),
    );

    const { result, rerender } = await renderHook(
      (hasMore: boolean = true) =>
        useInfiniteScroll(sentinel, onLoadMore, { hasMore }),
    );

    await vi.waitFor(() => {
      expect(onLoadMore).toHaveBeenCalledOnce();
      expect(result.current.isLoading).toBe(false);
    });

    await rerender(false);
    await act(async () => {
      await result.current.loadMore();
    });
    expect(onLoadMore).toHaveBeenCalledOnce();
  });
});
