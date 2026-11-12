import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import { useFocusTrap } from '@/hooks/useFocusTrap';

describe('useFocusTrap', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('focuses initial element, cycles Tab/Shift+Tab, handles Escape, and restores focus', async () => {
    const trigger = document.createElement('button');
    trigger.textContent = 'Trigger';
    const container = document.createElement('div');
    const btn1 = document.createElement('button');
    btn1.id = 'first';
    btn1.textContent = 'First';
    const btn2 = document.createElement('button');
    btn2.id = 'second';
    btn2.textContent = 'Second';

    container.append(btn1, btn2);
    document.body.append(trigger, container);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    const onEscape = vi.fn();

    const { unmount } = await renderHook(() =>
      useFocusTrap(container, {
        initialFocus: '#second',
        restoreFocus: true,
        onEscape,
      })
    );

    expect(document.activeElement).toBe(btn2);

    const tabForward = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(tabForward);
    expect(tabForward.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(btn1);

    const tabBackward = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(tabBackward);
    expect(tabBackward.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(btn2);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(onEscape).toHaveBeenCalledTimes(1);

    await unmount();
    expect(document.activeElement).toBe(trigger);
  });

  it('focuses container itself with tabindex=-1 when no focusable children exist', async () => {
    const emptyContainer = document.createElement('div');
    document.body.appendChild(emptyContainer);

    await renderHook(() => useFocusTrap(emptyContainer));

    expect(emptyContainer.getAttribute('tabindex')).toBe('-1');
    expect(document.activeElement).toBe(emptyContainer);
  });
});
