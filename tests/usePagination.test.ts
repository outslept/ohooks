import { usePagination, type UsePaginationOptions } from "@/hooks/usePagination";
import { describe, expect, it, vi } from "vitest";
import { renderHook } from "vitest-browser-react";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe("usePagination", () => {
  it("computes ranges, single-page gap bridges, ellipses, indices, and navigation actions", async () => {
    const { result, act } = await renderHook(() =>
      usePagination({ totalItems: 95, pageSize: 10, defaultPage: 1 }),
    );

    expect(result.current.totalPages).toBe(10);
    expect(result.current.items).toEqual([1, 2, 3, 4, 5, "ellipsis", 10]);
    expect(result.current.hasPrevPage).toBe(false);
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.startIndex).toBe(0);
    expect(result.current.endIndex).toBe(10);

    await act(async () => {
      result.current.setPage(3);
    });
    expect(result.current.items).toEqual([1, 2, 3, 4, 5, "ellipsis", 10]);

    await act(async () => {
      result.current.setPage(5);
    });
    expect(result.current.items).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 10]);

    await act(async () => {
      result.current.setPage(8);
    });
    expect(result.current.items).toEqual([1, "ellipsis", 6, 7, 8, 9, 10]);

    await act(async () => {
      result.current.lastPage();
    });
    expect(result.current.page).toBe(10);
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.startIndex).toBe(90);
    expect(result.current.endIndex).toBe(95);

    await act(async () => {
      result.current.prevPage();
    });
    expect(result.current.page).toBe(9);

    await act(async () => {
      result.current.nextPage();
    });
    expect(result.current.page).toBe(10);

    await act(async () => {
      result.current.firstPage();
    });
    expect(result.current.page).toBe(1);
  });

  it("supports controlled page, explicit totalPages without ellipsis, and ignores out-of-range transitions", async () => {
    const onChange = vi.fn();
    const { result, rerender, act } = await renderHook(
      (props?: UsePaginationOptions) =>
        usePagination({ totalPages: 5, pageSize: 10, onChange, ...props }),
      { initialProps: { page: 1 } },
    );

    expect(result.current.items).toEqual([1, 2, 3, 4, 5]);
    expect(result.current.endIndex).toBe(10);

    await act(async () => {
      result.current.prevPage();
    });
    expect(onChange).not.toHaveBeenCalled();

    await act(async () => {
      result.current.setPage(99);
    });
    expect(onChange).toHaveBeenCalledWith(5);

    await rerender({ page: 5 });
    expect(result.current.page).toBe(5);
  });
});
