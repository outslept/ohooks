import { useControllableState } from '@/hooks/useControllableState';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useControllableState', () => {
  it('manages state internally when uncontrolled and respects shouldUpdate', async () => {
    const onChange = vi.fn();
    const { result } = await renderHook(() =>
      useControllableState({
        defaultValue: () => 1,
        onChange,
      }),
    );
    expect(result.current[0]).toBe(1);
    expect(result.current[2]).toBe(false);

    act(() => result.current[1](1));
    expect(onChange).not.toHaveBeenCalled();

    act(() => result.current[1]((prev) => prev + 4));
    expect(result.current[0]).toBe(5);
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('delegates state to parent when controlled and warns on mode switch', async () => {
    vi.stubGlobal('process', { env: { NODE_ENV: 'development' } });
    const onChange = vi.fn();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result, rerender } = await renderHook(
      (controlled: boolean = true) =>
        useControllableState({
          value: controlled ? 10 : undefined,
          defaultValue: 0,
          onChange,
        }),
    );
    expect(result.current[0]).toBe(10);
    expect(result.current[2]).toBe(true);

    act(() => result.current[1](20));
    expect(result.current[0]).toBe(10);
    expect(onChange).toHaveBeenCalledWith(20);

    await rerender(false);
    expect(result.current[2]).toBe(false);
    expect(warnSpy).toHaveBeenCalledOnce();

    warnSpy.mockRestore();
    vi.unstubAllGlobals();
  });
});
