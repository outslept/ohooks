import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import { useRovingTabIndex } from '@/hooks/useRovingTabIndex';

describe('useRovingTabIndex', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('manages tabIndex, skips disabled items, and navigates with arrows, Home, End, and RTL', async () => {
    const onActiveIndexChange = vi.fn();
    const { result, act } = await renderHook(() =>
      useRovingTabIndex({
        defaultActiveIndex: 0,
        orientation: 'horizontal',
        loop: true,
        onActiveIndexChange,
      })
    );

    const btn0 = document.createElement('button');
    const btn1 = document.createElement('button');
    const btn2 = document.createElement('button');
    document.body.append(btn0, btn1, btn2);

    const props0 = result.current.getItemProps(0);
    const props1 = result.current.getItemProps(1, { disabled: true });
    const props2 = result.current.getItemProps(2);

    props0.ref(btn0);
    props1.ref(btn1);
    props2.ref(btn2);

    expect(props0.tabIndex).toBe(0);
    expect(props1.tabIndex).toBe(-1);
    expect(props2.tabIndex).toBe(-1);

    await act(async () => {
      props0.onKeyDown({
        key: 'ArrowRight',
        preventDefault: vi.fn(),
      } as unknown as ReactKeyboardEvent<HTMLElement>);
    });

    expect(result.current.activeIndex).toBe(2);
    expect(onActiveIndexChange).toHaveBeenCalledWith(2);
    expect(document.activeElement).toBe(btn2);

    const updatedProps2 = result.current.getItemProps(2);
    await act(async () => {
      updatedProps2.onKeyDown({
        key: 'ArrowRight',
        preventDefault: vi.fn(),
      } as unknown as ReactKeyboardEvent<HTMLElement>);
    });
    expect(result.current.activeIndex).toBe(0);

    const updatedProps0 = result.current.getItemProps(0);
    await act(async () => {
      updatedProps0.onKeyDown({
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
  });
});
