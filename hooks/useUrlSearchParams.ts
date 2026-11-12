import { useCallback, useRef, useSyncExternalStore } from 'react';
import { useEventCallback } from './useEventCallback';

export type UrlSearchParamPrimitive = string | number | boolean;

export type UrlSearchParamsRecord = Record<
  string,
  | UrlSearchParamPrimitive
  | ReadonlyArray<UrlSearchParamPrimitive>
  | null
  | undefined
>;

export type UrlSearchParamsInit =
  | string
  | URLSearchParams
  | ReadonlyArray<readonly [string, UrlSearchParamPrimitive]>
  | UrlSearchParamsRecord;

export type SetUrlSearchParamsAction =
  | UrlSearchParamsInit
  | ((prev: URLSearchParams) => UrlSearchParamsInit);

export interface SetUrlSearchParamsOptions {
  replace?: boolean;
  state?: unknown;
}

export interface UseUrlSearchParamsOptions {
  defaultInit?: UrlSearchParamsInit;
}

const CUSTOM_SEARCH_PARAMS_EVENT = 'custom-url-search-params';

function createUrlSearchParams(init?: UrlSearchParamsInit): URLSearchParams {
  if (!init) {
    return new URLSearchParams();
  }
  if (typeof init === 'string') {
    return new URLSearchParams(init);
  }
  if (init instanceof URLSearchParams) {
    return new URLSearchParams(init);
  }
  if (Array.isArray(init)) {
    const params = new URLSearchParams();
    for (const [key, value] of init) {
      params.append(key, String(value));
    }
    return params;
  }

  const params = new URLSearchParams();
  for (const [key, rawValue] of Object.entries(init)) {
    if (rawValue === undefined || rawValue === null) {
      continue;
    }
    if (Array.isArray(rawValue)) {
      for (const item of rawValue) {
        params.append(key, String(item));
      }
    } else {
      params.set(key, String(rawValue));
    }
  }
  return params;
}

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener('popstate', onStoreChange);
  window.addEventListener(CUSTOM_SEARCH_PARAMS_EVENT, onStoreChange);

  return () => {
    window.removeEventListener('popstate', onStoreChange);
    window.removeEventListener(CUSTOM_SEARCH_PARAMS_EVENT, onStoreChange);
  };
}

export function useUrlSearchParams(
  options: UseUrlSearchParamsOptions = {},
): [
  URLSearchParams,
  (nextInit: SetUrlSearchParamsAction, navOptions?: SetUrlSearchParamsOptions) => void,
] {
  const { defaultInit } = options;

  const cacheRef = useRef<{ raw: string; params: URLSearchParams } | null>(
    null,
  );
  const serverSnapshotRef = useRef<URLSearchParams | null>(null);

  const getSnapshot = useCallback((): URLSearchParams => {
    if (typeof window === 'undefined') {
      return createUrlSearchParams(defaultInit);
    }

    const currentSearch = window.location.search;
    if (cacheRef.current !== null && cacheRef.current.raw === currentSearch) {
      return cacheRef.current.params;
    }

    const params = new URLSearchParams(currentSearch);
    cacheRef.current = { raw: currentSearch, params };
    return params;
  }, [defaultInit]);

  const getServerSnapshot = useCallback((): URLSearchParams => {
    if (serverSnapshotRef.current === null) {
      serverSnapshotRef.current = createUrlSearchParams(defaultInit);
    }
    return serverSnapshotRef.current;
  }, [defaultInit]);

  const searchParams = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setSearchParams = useEventCallback(
    (
      nextInit: SetUrlSearchParamsAction,
      navOptions: SetUrlSearchParamsOptions = {},
    ) => {
      if (typeof window === 'undefined') {
        return;
      }

      const { replace = false, state = window.history.state } = navOptions;

      const resolvedInit =
        typeof nextInit === 'function'
          ? nextInit(new URLSearchParams(window.location.search))
          : nextInit;

      const nextParams = createUrlSearchParams(resolvedInit);
      const searchString = nextParams.toString();
      const nextSearch = searchString ? `?${searchString}` : '';

      const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      const nextUrl = `${window.location.pathname}${nextSearch}${window.location.hash}`;

      if (currentUrl === nextUrl) {
        return;
      }

      if (replace) {
        window.history.replaceState(state, '', nextUrl);
      } else {
        window.history.pushState(state, '', nextUrl);
      }

      window.dispatchEvent(new CustomEvent(CUSTOM_SEARCH_PARAMS_EVENT));
    },
  );

  return [searchParams, setSearchParams];
}
