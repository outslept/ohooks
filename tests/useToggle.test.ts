import { useToggle } from '@/hooks/useToggle';
import { act } from 'react';
import { describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useToggle', () => {
  it('toggles state, accepts explicit boolean, and ignores non-boolean event args', async () => {
    const { result } = await renderHook(() => useToggle());
    expect(result.current[0]).toBe(false);

    act(() => result.current[1]());
    expect(result.current[0]).toBe(true);

    act(() => result.current[1](true));
    expect(result.current[0]).toBe(true);

    act(() => result.current[1](false));
    expect(result.current[0]).toBe(false);

    act(() => result.current[1]({ type: 'click' }));
    expect(result.current[0]).toBe(true);

    act(() => result.current[2](false));
    expect(result.current[0]).toBe(false);
  });

  it('initializes with true when provided', async () => {
    const { result } = await renderHook(() => useToggle(true));
    expect(result.current[0]).toBe(true);
  });
});
