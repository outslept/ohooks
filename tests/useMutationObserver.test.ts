import { useMutationObserver } from '@/hooks/useMutationObserver';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useMutationObserver', () => {
  let el: HTMLDivElement;

  beforeEach(() => {
    el = document.createElement('div');
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it('triggers callback on DOM attribute and childList mutations', async () => {
    const callback = vi.fn();
    await renderHook(() =>
      useMutationObserver(el, callback, { attributes: true, childList: true }),
    );

    el.setAttribute('data-test', 'active');
    el.appendChild(document.createElement('span'));

    await vi.waitFor(() => {
      expect(callback).toHaveBeenCalled();
    });
  });
});
