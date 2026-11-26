import { useCallback, useEffect, useState } from "react";
import { useEventCallback } from "./useEventCallback";

/** Accepted initializer formats for URL search parameters. */
export type UrlSearchParamsInit =
  | string
  | URLSearchParams
  | Record<string, string | number | boolean | null | undefined>
  | ReadonlyArray<readonly [string, string]>;

/** Configuration options for `useUrlSearchParams`. */
export interface UseUrlSearchParamsOptions {
  /** History API update mode (`'replace'` or `'push'`, default: `'replace'`). */
  historyMode?: "push" | "replace";
  /** Fallback query parameters when `window.location.search` is empty or during SSR. */
  initialValue?: UrlSearchParamsInit;
}

/** Updater value or function accepted by `setParams`. */
export type SetUrlSearchParamsAction =
  | UrlSearchParamsInit
  | ((prev: URLSearchParams) => UrlSearchParamsInit);

/** Tuple returned by `useUrlSearchParams`. */
export type UseUrlSearchParamsReturn = [
  params: URLSearchParams,
  setParams: (
    nextInit: SetUrlSearchParamsAction,
    overrideOptions?: { historyMode?: "push" | "replace" },
  ) => void,
];

const URL_SEARCH_CHANGE_EVENT = "custom-url-search-params-change";

function isTupleArray(init: UrlSearchParamsInit): init is ReadonlyArray<readonly [string, string]> {
  return Array.isArray(init);
}

function createSearchParams(init?: UrlSearchParamsInit): URLSearchParams {
  if (!init) {
    return new URLSearchParams();
  }
  if (typeof init === "string") {
    return new URLSearchParams(init);
  }
  if (init instanceof URLSearchParams) {
    return new URLSearchParams(init.toString());
  }
  if (isTupleArray(init)) {
    return new URLSearchParams(init.map(([key, value]) => [key, value]));
  }
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(init)) {
    if (value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  }
  return params;
}

function readWindowSearch(initialValue?: UrlSearchParamsInit): string {
  if (typeof window === "undefined") {
    return createSearchParams(initialValue).toString();
  }
  const currentSearch = window.location.search.replace(/^\?/, "");
  if (currentSearch.length > 0) {
    return currentSearch;
  }
  return createSearchParams(initialValue).toString();
}

/**
 * Reads and updates `window.location.search` as reactive `URLSearchParams` synchronized with browser history.
 *
 * @category Storage
 * @param options - Default history mode and fallback `initialValue` options
 * @returns A tuple of `[params, setParams]`
 *
 * @example
 * ```tsx
 * const [searchParams, setSearchParams] = useUrlSearchParams();
 * const query = searchParams.get('q') ?? '';
 * ```
 */
export function useUrlSearchParams(
  options: UseUrlSearchParamsOptions = {},
): UseUrlSearchParamsReturn {
  const { historyMode = "replace", initialValue } = options;

  const [rawSearch, setRawSearch] = useState<string>(() => readWindowSearch(initialValue));

  const params = new URLSearchParams(rawSearch);

  const setParams = useEventCallback(
    (
      nextInit: SetUrlSearchParamsAction,
      overrideOptions?: { historyMode?: "push" | "replace" },
    ) => {
      const currentParams = new URLSearchParams(rawSearch);
      const resolvedInit = typeof nextInit === "function" ? nextInit(currentParams) : nextInit;
      const nextParams = createSearchParams(resolvedInit);
      const nextSearchString = nextParams.toString();

      setRawSearch(nextSearchString);

      if (typeof window !== "undefined") {
        const mode = overrideOptions?.historyMode ?? historyMode;
        const { pathname, hash } = window.location;
        const query = nextSearchString ? `?${nextSearchString}` : "";
        const nextUrl = `${pathname}${query}${hash}`;

        if (mode === "push") {
          window.history.pushState(window.history.state, "", nextUrl);
        } else {
          window.history.replaceState(window.history.state, "", nextUrl);
        }

        window.dispatchEvent(new Event(URL_SEARCH_CHANGE_EVENT));
      }
    },
  );

  const syncFromLocation = useCallback(() => {
    if (typeof window === "undefined") return;
    setRawSearch(window.location.search.replace(/^\?/, ""));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.addEventListener("popstate", syncFromLocation);
    window.addEventListener(URL_SEARCH_CHANGE_EVENT, syncFromLocation);

    return () => {
      window.removeEventListener("popstate", syncFromLocation);
      window.removeEventListener(URL_SEARCH_CHANGE_EVENT, syncFromLocation);
    };
  }, [syncFromLocation]);

  return [params, setParams];
}

export default useUrlSearchParams;
