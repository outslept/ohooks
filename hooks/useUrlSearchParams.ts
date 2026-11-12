import { useCallback, useEffect, useState } from 'react';
import { useEventCallback } from './useEventCallback';

export type UrlSearchParamsInit =
  | string
  | URLSearchParams
  | Record<string, string | number | boolean | null | undefined>
  | ReadonlyArray<readonly [string, string]>;

export interface UseUrlSearchParamsOptions {
  historyMode?: 'push' | 'replace';
  initialValue?: UrlSearchParamsInit;
}

export type SetUrlSearchParamsAction =
  | UrlSearchParamsInit
  | ((prev: URLSearchParams) => UrlSearchParamsInit);

export type UseUrlSearchParamsReturn = [
  params: URLSearchParams,
  setParams: (
    nextInit: SetUrlSearchParamsAction,
    overrideOptions?: { historyMode?: 'push' | 'replace' }
  ) => void,
];

const URL_SEARCH_CHANGE_EVENT = 'custom-url-search-params-change';

function isTupleArray(
  init: UrlSearchParamsInit
): init is ReadonlyArray<readonly [string, string]> {
  return Array.isArray(init);
}

function createSearchParams(init?: UrlSearchParamsInit): URLSearchParams {
  if (!init) {
    return new URLSearchParams();
  }
  if (typeof init === 'string') {
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
  if (typeof window === 'undefined') {
    return createSearchParams(initialValue).toString();
  }
  const currentSearch = window.location.search.replace(/^\?/, '');
  if (currentSearch.length > 0) {
    return currentSearch;
  }
  return createSearchParams(initialValue).toString();
}

export function useUrlSearchParams(
  options: UseUrlSearchParamsOptions = {}
): UseUrlSearchParamsReturn {
  const { historyMode = 'replace', initialValue } = options;

  const [rawSearch, setRawSearch] = useState<string>(() =>
    readWindowSearch(initialValue)
  );

  const params = new URLSearchParams(rawSearch);

  const setParams = useEventCallback(
    (
      nextInit: SetUrlSearchParamsAction,
      overrideOptions?: { historyMode?: 'push' | 'replace' }
    ) => {
      const currentParams = new URLSearchParams(rawSearch);
      const resolvedInit =
        typeof nextInit === 'function' ? nextInit(currentParams) : nextInit;
      const nextParams = createSearchParams(resolvedInit);
      const nextSearchString = nextParams.toString();

      setRawSearch(nextSearchString);

      if (typeof window !== 'undefined') {
        const mode = overrideOptions?.historyMode ?? historyMode;
        const { pathname, hash } = window.location;
        const query = nextSearchString ? `?${nextSearchString}` : '';
        const nextUrl = `${pathname}${query}${hash}`;

        if (mode === 'push') {
          window.history.pushState(window.history.state, '', nextUrl);
        } else {
          window.history.replaceState(window.history.state, '', nextUrl);
        }

        window.dispatchEvent(new Event(URL_SEARCH_CHANGE_EVENT));
      }
    }
  );

  const syncFromLocation = useCallback(() => {
    if (typeof window === 'undefined') return;
    setRawSearch(window.location.search.replace(/^\?/, ''));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('popstate', syncFromLocation);
    window.addEventListener(URL_SEARCH_CHANGE_EVENT, syncFromLocation);

    return () => {
      window.removeEventListener('popstate', syncFromLocation);
      window.removeEventListener(URL_SEARCH_CHANGE_EVENT, syncFromLocation);
    };
  }, [syncFromLocation]);

  return [params, setParams];
}

export default useUrlSearchParams;
