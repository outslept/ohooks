import { useMeasure, type UseMeasureOptions } from '@/hooks/useMeasure';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe('useMeasure', () => {
  let el: HTMLDivElement;

  beforeEach(() => {
    el = document.createElement('div');
    el.style.boxSizing = 'border-box';
    el.style.width = '150px';
    el.style.height = '90px';
    el.style.paddingLeft = '10px';
    el.style.paddingRight = '20px';
    el.style.paddingTop = '5px';
    el.style.paddingBottom = '15px';
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it('measures content-box and border-box dimensions and tracks ResizeObserver updates', async () => {
    const { result, rerender, act } = await renderHook(
      (props?: UseMeasureOptions) => useMeasure<HTMLDivElement>(props),
      { initialProps: { box: 'content-box' } }
    );

    expect(result.current[1].width).toBe(0);

    await act(async () => {
      result.current[0](el);
    });


    await expect.poll(() => result.current[1].width).toBe(120);
    expect(result.current[1].height).toBe(70);
    expect(result.current[1].left).toBe(10);
    expect(result.current[1].top).toBe(5);
    expect(result.current[1].right).toBe(130);
    expect(result.current[1].bottom).toBe(75);

    el.style.height = '130px';
    await expect.poll(() => result.current[1].height).toBe(110);


    await rerender({ box: 'border-box' });
    await expect.poll(() => result.current[1].width).toBe(150);
    expect(result.current[1].height).toBe(130);
    expect(result.current[1].left).toBe(0);
    expect(result.current[1].top).toBe(0);
  });

  it('does not measure when enabled is false', async () => {
    const { result, act } = await renderHook(() =>
      useMeasure<HTMLDivElement>({ enabled: false })
    );

    await act(async () => {
      result.current[0](el);
    });

    expect(result.current[1].width).toBe(0);
    expect(result.current[1].height).toBe(0);
  });
});
