import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import { matchesHotkey, useHotkeys } from '@/hooks/useHotkeys';

describe('useHotkeys', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('matchesHotkey parses modifiers, aliases, mod, and plus key', () => {
    const ctrlK = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
    expect(matchesHotkey('ctrl+k', ctrlK)).toBe(true);
    expect(matchesHotkey('ctrl+shift+k', ctrlK)).toBe(false);

    const cmdS = new KeyboardEvent('keydown', { key: 's', metaKey: true });
    expect(matchesHotkey('mod+s', cmdS, true)).toBe(true);
    expect(matchesHotkey('mod+s', cmdS, false)).toBe(false);

    const esc = new KeyboardEvent('keydown', { key: 'Escape' });
    expect(matchesHotkey('esc', esc)).toBe(true);

    const ctrlPlus = new KeyboardEvent('keydown', { key: '+', ctrlKey: true });
    expect(matchesHotkey('ctrl++', ctrlPlus)).toBe(true);
  });

  it('executes callback on matching combo and skips form tags unless enableOnFormTags is true', async () => {
    const callback = vi.fn();
    const input = document.createElement('input');
    document.body.appendChild(input);

    const { rerender } = await renderHook((enableOnFormTags: boolean = false) =>
      useHotkeys('ctrl+k, alt+enter', callback, {
        enableOnFormTags,
        stopPropagation: true,
      })
    );

    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true, cancelable: true })
    );
    expect(callback).not.toHaveBeenCalled();

    const winEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      altKey: true,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(winEvent);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(winEvent, 'alt+enter');
    expect(winEvent.defaultPrevented).toBe(true);

    await rerender(true);
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true, cancelable: true })
    );
    expect(callback).toHaveBeenCalledTimes(2);
  });
});
