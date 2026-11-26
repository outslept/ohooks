import { useQueue } from '@/hooks/useQueue';
import { describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe('useQueue', () => {
  it('defaults to an empty queue and handles synchronous FIFO operations within the same tick', async () => {
    const { result: emptyResult } = await renderHook(() => useQueue<number>());
    expect(emptyResult.current.isEmpty).toBe(true);
    expect(emptyResult.current.first).toBeUndefined();
    expect(emptyResult.current.last).toBeUndefined();

    const { result, act } = await renderHook(() => useQueue(() => [1]));

    expect(result.current.first).toBe(1);
    expect(result.current.last).toBe(1);
    expect(result.current.size).toBe(1);
    expect(result.current.isEmpty).toBe(false);

    let firstDequeued: number | undefined;
    let secondDequeued: number | undefined;
    await act(async () => {
      result.current.enqueue();
      result.current.enqueue(2, 3);
      firstDequeued = result.current.dequeue();
      secondDequeued = result.current.dequeue();
    });

    expect(firstDequeued).toBe(1);
    expect(secondDequeued).toBe(2);
    expect(result.current.queue).toEqual([3]);
    expect(result.current.peek()).toBe(3);
    expect(result.current.last).toBe(3);

    await act(async () => {
      result.current.clear();
      result.current.clear();
    });
    expect(result.current.isEmpty).toBe(true);
    expect(result.current.last).toBeUndefined();
    expect(result.current.peek()).toBeUndefined();
    expect(result.current.dequeue()).toBeUndefined();

    await act(async () => {
      result.current.reset();
    });
    expect(result.current.queue).toEqual([1]);
  });
});
