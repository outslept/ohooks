import { useAsyncTask } from '@/hooks/useAsyncTask';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useAsyncTask', () => {
  it('handles success, error normalization, and reset', async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();

    const { result } = await renderHook(() =>
      useAsyncTask(
        async (_ctx, value: number) => {
          if (value < 0) {
            throw 'negative-value';
          }
          return value * 2;
        },
        { initialData: 0, resetDataOnRun: true, onSuccess, onError },
      ),
    );

    expect(result.current.isIdle).toBe(true);
    expect(result.current.data).toBe(0);

    await act(async () => {
      const res = await result.current.run(5);
      expect(res).toBe(10);
    });
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toBe(10);
    expect(onSuccess).toHaveBeenCalledWith(10);

    await act(async () => {
      await result.current.run(-1);
    });
    expect(result.current.isError).toBe(true);
    expect(result.current.data).toBe(0);
    expect(result.current.error?.message).toBe('negative-value');
    expect(onError).toHaveBeenCalledOnce();

    act(() => result.current.reset());
    expect(result.current.isIdle).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('aborts in-flight task manually and when superseded by a new run', async () => {
    const onAbort = vi.fn();

    const { result } = await renderHook(() =>
      useAsyncTask(
        ({ signal }, delayMs: number, label: string) =>
          new Promise<string>((resolve, reject) => {
            const timer = setTimeout(() => resolve(label), delayMs);
            signal.addEventListener('abort', () => {
              clearTimeout(timer);
              reject(new DOMException('Aborted', 'AbortError'));
            });
          }),
        { onAbort },
      ),
    );

    let firstPromise: Promise<string | undefined>;
    act(() => {
      firstPromise = result.current.run(50, 'first');
    });
    expect(result.current.isPending).toBe(true);

    await act(async () => {
      result.current.abort();
      await firstPromise;
    });
    expect(result.current.isAborted).toBe(true);
    expect(onAbort).toHaveBeenCalledOnce();

    await act(async () => {
      const p1 = result.current.run(50, 'stale');
      const p2 = result.current.run(5, 'fresh');
      const [r1, r2] = await Promise.all([p1, p2]);
      expect(r1).toBeUndefined();
      expect(r2).toBe('fresh');
    });
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toBe('fresh');
  });
});
