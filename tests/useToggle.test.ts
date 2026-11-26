import { useToggle } from '@/hooks/useToggle';
import { describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe('useToggle', () => {
  it('toggles state, accepts explicit boolean, and ignores non-boolean event args', async () => {
    const { result, act } = await renderHook(() => useToggle());
    expect(result.current[0]).toBe(false);

    await act(async () => {
      result.current[1]();
    });
    expect(result.current[0]).toBe(true);

    await act(async () => {
      result.current[1](true);
    });
    expect(result.current[0]).toBe(true);

    await act(async () => {
      result.current[1](false);
    });
    expect(result.current[0]).toBe(false);

    await act(async () => {
      result.current[1]({ type: 'click' });
    });
    expect(result.current[0]).toBe(true);

    await act(async () => {
      result.current[2](false);
    });
    expect(result.current[0]).toBe(false);
  });

  it('initializes with true when provided', async () => {
    const { result } = await renderHook(() => useToggle(true));
    expect(result.current[0]).toBe(true);
  });
});
