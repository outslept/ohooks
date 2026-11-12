import { useCookie } from '@/hooks/useCookie';
import { act } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useCookie', () => {
  afterEach(() => {
    document.cookie = 'test_cookie=; path=/; max-age=0';
  });

  it('reads defaultValue, writes encoded cookie, syncs across hooks, and deletes cookie', async () => {
    const { result: hookA } = await renderHook(() =>
      useCookie('test_cookie', { defaultValue: 'default-val', sameSite: 'lax' }),
    );
    const { result: hookB } = await renderHook(() =>
      useCookie('test_cookie', { defaultValue: 'default-val' }),
    );

    expect(hookA.current[0]).toBe('default-val');

    act(() => {
      hookA.current[1]('hello world', { maxAge: 3600 });
    });

    expect(hookA.current[0]).toBe('hello world');
    expect(hookB.current[0]).toBe('hello world');

    act(() => {
      hookA.current[2]();
    });

    expect(hookA.current[0]).toBe('default-val');
    expect(hookB.current[0]).toBe('default-val');
  });
});
