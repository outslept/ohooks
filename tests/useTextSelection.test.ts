import { afterEach, describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import { useTextSelection } from '@/hooks/useTextSelection';

describe('useTextSelection', () => {
  afterEach(() => {
    window.getSelection()?.removeAllRanges();
    document.body.innerHTML = '';
  });

  it('tracks document text selection and resets when cleared', async () => {
    const p = document.createElement('p');
    p.textContent = 'Hello selectable world';
    document.body.appendChild(p);

    const { result, act } = await renderHook(() => useTextSelection());

    expect(result.current.text).toBe('');
    expect(result.current.ranges).toHaveLength(0);

    await act(async () => {
      const range = document.createRange();
      range.selectNodeContents(p);
      const sel = window.getSelection()!;
      sel.removeAllRanges();
      sel.addRange(range);
      document.dispatchEvent(new Event('selectionchange'));
    });

    expect(result.current.text).toBe('Hello selectable world');
    expect(result.current.ranges).toHaveLength(1);
    expect(result.current.rect).not.toBeNull();

    await act(async () => {
      window.getSelection()?.removeAllRanges();
      document.dispatchEvent(new Event('selectionchange'));
    });

    expect(result.current.text).toBe('');
    expect(result.current.rect).toBeNull();
  });

  it('scopes selection to target container when provided', async () => {
    const scoped = document.createElement('div');
    scoped.textContent = 'Inside container';
    const outside = document.createElement('div');
    outside.textContent = 'Outside container';
    document.body.append(scoped, outside);

    const { result, act } = await renderHook(() => useTextSelection(scoped));

    await act(async () => {
      const range = document.createRange();
      range.selectNodeContents(outside);
      const sel = window.getSelection()!;
      sel.removeAllRanges();
      sel.addRange(range);
      document.dispatchEvent(new Event('selectionchange'));
    });

    expect(result.current.text).toBe('');

    await act(async () => {
      const range = document.createRange();
      range.selectNodeContents(scoped);
      const sel = window.getSelection()!;
      sel.removeAllRanges();
      sel.addRange(range);
      document.dispatchEvent(new Event('selectionchange'));
    });

    expect(result.current.text).toBe('Inside container');
  });
});
