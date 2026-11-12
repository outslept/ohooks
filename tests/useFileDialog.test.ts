import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import { useFileDialog } from '@/hooks/useFileDialog';

describe('useFileDialog', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates file input, opens dialog with local overrides, handles change/cancel, and resets', async () => {
    let createdInput: HTMLInputElement | null = null;
    const origCreateElement = document.createElement.bind(document);

    vi.spyOn(document, 'createElement').mockImplementation(((tagName: string) => {
      const el = origCreateElement(tagName);
      if (tagName === 'input') {
        createdInput = el as HTMLInputElement;
        vi.spyOn(createdInput, 'click').mockImplementation(() => {});
      }
      return el;
    }) as typeof document.createElement);

    const onChange = vi.fn();
    const onCancel = vi.fn();

    const { result, act } = await renderHook(() =>
      useFileDialog({
        accept: 'image/*',
        multiple: false,
        onChange,
        onCancel,
      })
    );

    await act(async () => {
      result.current.open({ accept: '.pdf', multiple: true, directory: true });
    });

    expect(createdInput).not.toBeNull();
    expect(createdInput!.accept).toBe('.pdf');
    expect(createdInput!.multiple).toBe(true);
    expect(createdInput!.webkitdirectory).toBe(true);
    expect(createdInput!.click).toHaveBeenCalledTimes(1);

    const file = new File(['pdf'], 'doc.pdf', { type: 'application/pdf' });
    const dt = new DataTransfer();
    dt.items.add(file);

    await act(async () => {
      Object.defineProperty(createdInput!, 'files', {
        value: dt.files,
        configurable: true,
      });
      createdInput!.dispatchEvent(new Event('change'));
    });

    expect(result.current.files).toHaveLength(1);
    expect(result.current.files?.[0]).toBe(file);
    expect(onChange).toHaveBeenCalledWith(dt.files);

    await act(async () => {
      createdInput!.dispatchEvent(new Event('cancel'));
    });
    expect(onCancel).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.reset();
    });
    expect(result.current.files).toBeNull();
  });
});
