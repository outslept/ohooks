import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useDocumentTitle', () => {
  beforeEach(() => {
    document.title = 'Original Title';
  });

  it('sets document.title and optionally restores original title on unmount', async () => {
    const { rerender, unmount } = await renderHook(
      (title: string = 'Page 1') =>
        useDocumentTitle(title, { restoreOnUnmount: true }),
    );
    expect(document.title).toBe('Page 1');

    await rerender('Page 2');
    expect(document.title).toBe('Page 2');

    await unmount();
    expect(document.title).toBe('Original Title');
  });
});
