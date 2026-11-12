import { mergeRefs, useMergeRefs } from '@/hooks/useMergeRefs';
import { act, createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useMergeRefs', () => {
  it('attaches node to object and callback refs, swaps refs dynamically, and runs React 19 cleanups', async () => {
    const objRef1 = createRef<HTMLDivElement>();
    const objRef2 = createRef<HTMLDivElement>();
    const cleanupSpy = vi.fn();
    const cbRefWithCleanup = vi.fn(() => cleanupSpy);

    const { result, rerender } = await renderHook(
      (secondRef: typeof objRef1 = objRef1) =>
        useMergeRefs(secondRef, cbRefWithCleanup),
    );

    const node = document.createElement('div');
    let unmountCleanup: (() => void) | void;

    act(() => {
      unmountCleanup = result.current(node);
    });
    expect(objRef1.current).toBe(node);
    expect(cbRefWithCleanup).toHaveBeenCalledWith(node);

    await rerender(objRef2);
    expect(objRef1.current).toBeNull();
    expect(objRef2.current).toBe(node);

    act(() => {
      if (typeof unmountCleanup === 'function') {
        unmountCleanup();
      }
    });
    expect(objRef2.current).toBeNull();
    expect(cleanupSpy).toHaveBeenCalledOnce();
  });

  it('mergeRefs utility handles null node and callback cleanups', () => {
    const objRef = createRef<HTMLSpanElement>();
    const cbRef = vi.fn();
    const merged = mergeRefs(objRef, cbRef, null, undefined);

    const span = document.createElement('span');
    merged(span);
    expect(objRef.current).toBe(span);
    expect(cbRef).toHaveBeenCalledWith(span);

    merged(null);
    expect(objRef.current).toBeNull();
    expect(cbRef).toHaveBeenLastCalledWith(null);
  });
});
