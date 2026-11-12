import { useInert } from '@/hooks/useInert';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useInert', () => {
  let targetEl: HTMLDivElement;
  let siblingEl: HTMLDivElement;

  beforeEach(() => {
    targetEl = document.createElement('div');
    siblingEl = document.createElement('div');
    document.body.append(targetEl, siblingEl);
  });

  afterEach(() => {
    targetEl.remove();
    siblingEl.remove();
  });

  it('applies inert and aria-hidden directly or to siblings and restores original state on unmount', async () => {
    const { unmount } = await renderHook(() => useInert(targetEl, true));
    expect(targetEl.hasAttribute('inert')).toBe(true);
    expect(targetEl.getAttribute('aria-hidden')).toBe('true');

    await unmount();
    expect(targetEl.hasAttribute('inert')).toBe(false);
    expect(targetEl.hasAttribute('aria-hidden')).toBe(false);

    const { unmount: unmountTrap } = await renderHook(() =>
      useInert(targetEl, true, { trapSiblings: true }),
    );
    expect(targetEl.hasAttribute('inert')).toBe(false);
    expect(siblingEl.hasAttribute('inert')).toBe(true);
    expect(siblingEl.getAttribute('aria-hidden')).toBe('true');

    await unmountTrap();
    expect(siblingEl.hasAttribute('inert')).toBe(false);
  });
});
