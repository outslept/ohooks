import type { DragEvent as ReactDragEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import { useDropZone } from '@/hooks/useDropZone';

function createMockDragEvent(files: File[]) {
  const dataTransfer = {
    files,
    items: files.map((f) => ({ kind: 'file', type: f.type })),
    dropEffect: 'none',
  };
  return {
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    dataTransfer,
  } as unknown as ReactDragEvent<HTMLElement>;
}

describe('useDropZone', () => {
  it('validates accepted MIME types/extensions, respects multiple=false, and clears files', async () => {
    const onDrop = vi.fn();
    const onDropRejected = vi.fn();

    const { result, act } = await renderHook(() =>
      useDropZone({
        accept: ['image/*', '.pdf'],
        multiple: false,
        onDrop,
        onDropRejected,
      })
    );

    const png1 = new File(['a'], 'one.png', { type: 'image/png' });
    const png2 = new File(['b'], 'two.png', { type: 'image/png' });
    const txt = new File(['c'], 'notes.txt', { type: 'text/plain' });

    await act(async () => {
      result.current.getRootProps().onDragEnter(createMockDragEvent([txt]));
    });
    expect(result.current.isOver).toBe(true);
    expect(result.current.isInvalid).toBe(true);

    await act(async () => {
      result.current.getRootProps().onDrop(createMockDragEvent([txt]));
    });
    expect(result.current.isOver).toBe(false);
    expect(result.current.files).toEqual([]);
    expect(onDropRejected).toHaveBeenCalledWith([txt], expect.anything());

    await act(async () => {
      result.current.getRootProps().onDrop(createMockDragEvent([png1, png2]));
    });
    expect(result.current.files).toEqual([]);

    await act(async () => {
      result.current.getRootProps().onDrop(createMockDragEvent([png1]));
    });
    expect(result.current.files).toEqual([png1]);
    expect(onDrop).toHaveBeenCalledWith([png1], expect.anything());

    await act(async () => {
      result.current.clearFiles();
    });
    expect(result.current.files).toEqual([]);
  });

  it('supports target element overload with native DOM DragEvents', async () => {
    const zone = document.createElement('div');
    const onDrop = vi.fn();

    const { result, act } = await renderHook(() =>
      useDropZone(zone, { accept: '.csv', onDrop })
    );

    const csv = new File(['1,2'], 'data.csv', { type: 'text/csv' });
    const dt = new DataTransfer();
    dt.items.add(csv);

    await act(async () => {
      zone.dispatchEvent(new DragEvent('dragenter', { dataTransfer: dt, bubbles: true }));
    });
    expect(result.current.isOver).toBe(true);

    await act(async () => {
      zone.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true }));
    });
    expect(result.current.isOver).toBe(false);
    expect(result.current.files).toEqual([csv]);
    expect(onDrop).toHaveBeenCalledTimes(1);
  });
});
