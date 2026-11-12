import { useUrlSearchParams } from '@/hooks/useUrlSearchParams';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useUrlSearchParams', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', window.location.pathname);
  });

  afterEach(() => {
    window.history.replaceState(null, '', window.location.pathname);
  });

  it('initializes from object, updates URL query via object/tuples/updater, and syncs across hooks', async () => {
    const { result: hookA } = await renderHook(() =>
      useUrlSearchParams({ initialValue: { page: 1, filter: 'all' } }),
    );
    const { result: hookB } = await renderHook(() => useUrlSearchParams());

    expect(hookA.current[0].get('page')).toBe('1');
    expect(hookA.current[0].get('filter')).toBe('all');

    act(() => {
      hookA.current[1](
        (prev) => {
          prev.set('page', '2');
          return prev;
        },
        { historyMode: 'push' },
      );
    });

    expect(window.location.search).toBe('?page=2&filter=all');
    expect(hookA.current[0].get('page')).toBe('2');
    expect(hookB.current[0].get('page')).toBe('2');

    act(() => {
      hookA.current[1]([['sort', 'asc']]);
    });
    expect(window.location.search).toBe('?sort=asc');
    expect(hookB.current[0].get('sort')).toBe('asc');
  });
});
