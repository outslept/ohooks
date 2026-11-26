import {
  useRovingTabIndex,
  type UseRovingTabIndexOptions,
} from '@/hooks/useRovingTabIndex';
import type {
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe('useRovingTabIndex', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('manages tabIndex, skips disabled items, and navigates with arrows, Home, End, and RTL', async () => {
    const onActiveIndexChange = vi.fn();
    const { result, rerender, act } = await renderHook(
      (props?: UseRovingTabIndexOptions) =>
        useRovingTabIndex({
          defaultActiveIndex: 0,
          orientation: 'horizontal',
          loop: true,
          onActiveIndexChange,
          ...props,
        }),
      { initialProps: { rtl: false } }
    );

    const btn0 = document.createElement('button');
    const btn1 = document.createElement('button');
    const btn2 = document.createElement('button');
    document.body.append(btn0, btn1, btn2);

    result.current.getItemProps(0).ref(btn0);
    result.current.getItemProps(1, { disabled: true }).ref(btn1);
    result.current.getItemProps(2).ref(btn2);

    expect(result.current.getItemProps(0).tabIndex).toBe(0);
    expect(result.current.getItemProps(1, { disabled: true }).tabIndex).toBe(-1);
    expect(result.current.getItemProps(2).tabIndex).toBe(-1);


    await act(async () => {
      result.current.getItemProps(0).onKeyDown({
        key: 'ArrowRight',
        preventDefault: vi.fn(),
      } as unknown as ReactKeyboardEvent<HTMLElement>);
    });
    expect(result.current.activeIndex).toBe(2);
    expect(onActiveIndexChange).toHaveBeenCalledWith(2);
    expect(document.activeElement).toBe(btn2);


    await act(async () => {
      result.current.getItemProps(2).onKeyDown({
        key: 'ArrowRight',
        preventDefault: vi.fn(),
      } as unknown as ReactKeyboardEvent<HTMLElement>);
    });
    expect(result.current.activeIndex).toBe(0);


    await act(async () => {
      result.current.getItemProps(0).onKeyDown({
        key: 'End',
        preventDefault: vi.fn(),
      } as unknown as ReactKeyboardEvent<HTMLElement>);
    });
    expect(result.current.activeIndex).toBe(2);

    await act(async () => {
      result.current.getItemProps(2).onKeyDown({
        key: 'Home',
        preventDefault: vi.fn(),
      } as unknown as ReactKeyboardEvent<HTMLElement>);
    });
    expect(result.current.activeIndex).toBe(0);


    await rerender({ rtl: true });
    await act(async () => {
      result.current.getItemProps(0).onKeyDown({
        key: 'ArrowLeft',
        preventDefault: vi.fn(),
      } as unknown as ReactKeyboardEvent<HTMLElement>);
    });
    expect(result.current.activeIndex).toBe(2);
  });

  it('supports vertical orientation, loop: false, onFocus sync, fallback tabbable index when active item is disabled, and custom handler preventDefault', async () => {
    const { result, rerender, act } = await renderHook(
      (props?: UseRovingTabIndexOptions) =>
        useRovingTabIndex({
          defaultActiveIndex: 0,
          orientation: 'vertical',
          loop: false,
          ...props,
        })
    );

    const btn0 = document.createElement('button');
    const btn1 = document.createElement('button');
    document.body.append(btn0, btn1);


    result.current.getItemProps(0, { disabled: true }).ref(btn0);
    result.current.getItemProps(1).ref(btn1);

    await rerender({});

    expect(result.current.getItemProps(1).tabIndex).toBe(0);


    const customFocus = vi.fn();
    await act(async () => {
      result.current
        .getItemProps(1, { onFocus: customFocus })
        .onFocus({} as ReactFocusEvent<HTMLElement>);
    });
    expect(result.current.activeIndex).toBe(1);
    expect(customFocus).toHaveBeenCalledTimes(1);


    await act(async () => {
      result.current.getItemProps(1).onKeyDown({
        key: 'ArrowDown',
        preventDefault: vi.fn(),
      } as unknown as ReactKeyboardEvent<HTMLElement>);
    });
    expect(result.current.activeIndex).toBe(1);


    await act(async () => {
      result.current
        .getItemProps(1, {
          onKeyDown: (e) => e.preventDefault(),
        })
        .onKeyDown({
          key: 'Home',
          defaultPrevented: true,
          preventDefault: vi.fn(),
        } as unknown as ReactKeyboardEvent<HTMLElement>);
    });
    expect(result.current.activeIndex).toBe(1);
  });
});
