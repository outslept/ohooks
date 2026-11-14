import { useQueue } from '@/hooks/useQueue';
import { describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useQueue', () => {
  it('handles FIFO operations synchronously within the same tick', async () => {
    const { result, act } = await renderHook(() => useQueue(() => [1]));

    expect(result.current.first).toBe(1);
    expect(result.current.last).toBe(1);
    expect(result.current.size).toBe(1);
    expect(result.current.isEmpty).toBe(false);

    let dequeued: number | undefined;
    await act(async () => {
      result.current.enqueue();
      result.current.enqueue(2, 3);
      dequeued = result.current.dequeue();
    });

    expect(dequeued).toBe(1);
    expect(result.current.queue).toEqual([2, 3]);
    expect(result.current.peek()).toBe(2);
    expect(result.current.last).toBe(3);

    await act(async () => {
      result.current.clear();
    });
    expect(result.current.isEmpty).toBe(true);
    expect(result.current.last).toBeUndefined();
    expect(result.current.peek()).toBeUndefined();
    expect(result.current.dequeue()).toBeUndefined();

    await act(async () => {
      result.current.clear();
    });
    expect(result.current.size).toBe(0);

    await act(async () => {
      result.current.reset();
    });
    expect(result.current.queue).toEqual([1]);
  });
});
