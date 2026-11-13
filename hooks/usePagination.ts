import { useMemo } from 'react';
import { useControllableState } from './useControllableState';
import { useEventCallback } from './useEventCallback';

export type PaginationItem = number | 'ellipsis';

export interface UsePaginationOptions {
  /** Total number of items across all pages (used with `pageSize` when `totalPages` is not set) */
  totalItems?: number;
  /** Number of items per page (default: `10`) */
  pageSize?: number;
  /** Explicit total number of pages (overrides `totalItems` / `pageSize` calculation) */
  totalPages?: number;
  /** Controlled current page number (`1`-indexed) */
  page?: number;
  /** Initial page number in uncontrolled mode (default: `1`) */
  defaultPage?: number;
  /** Number of sibling pages shown on each side of the current page (default: `1`) */
  siblingCount?: number;
  /** Number of boundary pages always shown at the start and end (default: `1`) */
  boundaryCount?: number;
  /** Callback fired when the active page changes */
  onChange?: (page: number) => void;
}

export interface UsePaginationReturn {
  /** Current active page number (`1`-indexed) */
  page: number;
  /** Total number of pages */
  totalPages: number;
  /** Sequence of page numbers and `'ellipsis'` markers for rendering pagination controls */
  items: PaginationItem[];
  /** Whether a previous page exists (`page > 1`) */
  hasPrevPage: boolean;
  /** Whether a next page exists (`page < totalPages`) */
  hasNextPage: boolean;
  /** Zero-based start index for slicing the current page's data */
  startIndex: number;
  /** Exclusive end index for slicing the current page's data */
  endIndex: number;
  /** Navigates to a specific page number (clamped to `[1, totalPages]`) */
  setPage: (page: number) => void;
  /** Advances to the next page */
  nextPage: () => void;
  /** Moves back to the previous page */
  prevPage: () => void;
  /** Jumps to page `1` */
  firstPage: () => void;
  /** Jumps to `totalPages` */
  lastPage: () => void;
}

function createRange(start: number, end: number): number[] {
  if (end < start) {
    return [];
  }
  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => start + idx);
}

/**
 * Computes pagination state, page ranges with ellipsis markers, data slice indices, and navigation helpers.
 *
 * @category State
 * @param options - Total items/pages, page size, controlled/default page, and sibling/boundary counts
 * @returns Pagination state (`page`, `totalPages`, `items`, `startIndex`, `endIndex`) and navigation methods
 *
 * @example
 * ```tsx
 * const { page, items, nextPage, prevPage, setPage } = usePagination({
 *   totalItems: 250,
 *   pageSize: 20,
 * });
 * ```
 */
export function usePagination(
  options: UsePaginationOptions = {},
): UsePaginationReturn {
  const {
    totalItems,
    pageSize = 10,
    totalPages: explicitTotalPages,
    page: controlledPage,
    defaultPage = 1,
    siblingCount = 1,
    boundaryCount = 1,
    onChange,
  } = options;

  const safePageSize = Math.max(1, Math.floor(pageSize));
  const safeSiblingCount = Math.max(0, Math.floor(siblingCount));
  const safeBoundaryCount = Math.max(0, Math.floor(boundaryCount));

  const totalPages =
    explicitTotalPages !== undefined
      ? Math.max(1, Math.floor(explicitTotalPages))
      : Math.max(1, Math.ceil(Math.max(0, totalItems ?? 0) / safePageSize));

  const [rawPage, setRawPage] = useControllableState<number>({
    value: controlledPage,
    defaultValue: defaultPage,
    onChange,
  });

  const page = Math.min(Math.max(1, Math.floor(rawPage)), totalPages);

  const items = useMemo<PaginationItem[]>(() => {
    const totalPageNumbers =
      safeBoundaryCount * 2 + safeSiblingCount * 2 + 3;

    if (totalPageNumbers >= totalPages) {
      return createRange(1, totalPages);
    }

    const startPages = createRange(
      1,
      Math.min(safeBoundaryCount, totalPages),
    );
    const endPages = createRange(
      Math.max(totalPages - safeBoundaryCount + 1, safeBoundaryCount + 1),
      totalPages,
    );

    const siblingsStart = Math.max(
      Math.min(
        page - safeSiblingCount,
        totalPages - safeBoundaryCount - safeSiblingCount * 2 - 1,
      ),
      safeBoundaryCount + 2,
    );

    const firstEndPage = endPages[0];
    const siblingsEnd = Math.min(
      Math.max(
        page + safeSiblingCount,
        safeBoundaryCount + safeSiblingCount * 2 + 2,
      ),
      firstEndPage !== undefined ? firstEndPage - 2 : totalPages - 1,
    );

    const result: PaginationItem[] = [...startPages];

    if (siblingsStart > safeBoundaryCount + 2) {
      result.push('ellipsis');
    } else if (safeBoundaryCount + 1 < totalPages - safeBoundaryCount) {
      result.push(safeBoundaryCount + 1);
    }

    result.push(...createRange(siblingsStart, siblingsEnd));

    if (siblingsEnd < totalPages - safeBoundaryCount - 1) {
      result.push('ellipsis');
    } else if (totalPages - safeBoundaryCount > safeBoundaryCount) {
      result.push(totalPages - safeBoundaryCount);
    }

    result.push(...endPages);

    return result;
  }, [page, totalPages, safeSiblingCount, safeBoundaryCount]);

  const setPage = useEventCallback((nextPage: number) => {
    const clamped = Math.min(Math.max(1, Math.floor(nextPage)), totalPages);
    if (clamped !== page) {
      setRawPage(clamped);
    }
  });

  const nextPage = useEventCallback(() => {
    setPage(page + 1);
  });

  const prevPage = useEventCallback(() => {
    setPage(page - 1);
  });

  const firstPage = useEventCallback(() => {
    setPage(1);
  });

  const lastPage = useEventCallback(() => {
    setPage(totalPages);
  });

  const startIndex = (page - 1) * safePageSize;
  const endIndex =
    totalItems !== undefined
      ? Math.min(startIndex + safePageSize, Math.max(0, totalItems))
      : startIndex + safePageSize;

  return {
    page,
    totalPages,
    items,
    hasPrevPage: page > 1,
    hasNextPage: page < totalPages,
    startIndex,
    endIndex,
    setPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
  };
}
