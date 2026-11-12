import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import { useFocus } from '@/hooks/useFocus';

describe('useFocus', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('tracks focus state, invokes callbacks, and exposes imperative focus/blur', async () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const onFocus = vi.fn();
    const onBlur = vi.fn();

    const { result, act } = await renderHook(() =>
      useFocus(input, { onFocus, onBlur })
    );

    expect(result.current.isFocused).toBe(true);

    await act(async () => {
      result.current.blur();
    });
    expect(result.current.isFocused).toBe(false);
    expect(onBlur).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.focus();
    });
    expect(result.current.isFocused).toBe(true);
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  it('respects focusVisible option', async () => {
    const btn = document.createElement('button');
    document.body.appendChild(btn);
    vi.spyOn(btn, 'matches').mockImplementation((selector) =>
      selector === ':focus-visible' ? false : false
    );

    const { result, act } = await renderHook(() =>
      useFocus(btn, { focusVisible: true })
    );

    await act(async () => {
      btn.dispatchEvent(new FocusEvent('focus'));
    });
    expect(result.current.isFocused).toBe(false);
  });
});
