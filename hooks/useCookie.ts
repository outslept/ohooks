import { useCallback, useSyncExternalStore } from 'react';
import { useEventCallback } from './useEventCallback';

export interface CookieAttributes {
  path?: string;
  domain?: string;
  expires?: Date | number;
  maxAge?: number;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export interface UseCookieOptions extends CookieAttributes {
  defaultValue?: string | null;
}

interface CookieStoreLike extends EventTarget {


}

interface WindowWithCookieStore extends Window {
  cookieStore?: CookieStoreLike;
}

const CUSTOM_COOKIE_EVENT = 'custom-cookie-change';

function readCookieFromDocument(name: string): string | null {
  if (typeof document === 'undefined' || !document.cookie) {
    return null;
  }

  const encodedName = encodeURIComponent(name);
  const cookies = document.cookie.split('; ');

  for (const part of cookies) {
    const eqIdx = part.indexOf('=');
    const rawKey = eqIdx === -1 ? part : part.slice(0, eqIdx);
    if (rawKey === encodedName) {
      const rawVal = eqIdx === -1 ? '' : part.slice(eqIdx + 1);
      try {
        return decodeURIComponent(rawVal);
      } catch {
        return rawVal;
      }
    }
  }

  return null;
}

function writeCookieToDocument(
  name: string,
  value: string,
  attrs: CookieAttributes,
): void {
  if (typeof document === 'undefined') {
    return;
  }

  const segments: string[] = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
  ];

  const path = attrs.path ?? '/';
  if (path) {
    segments.push(`path=${path}`);
  }

  if (attrs.domain) {
    segments.push(`domain=${attrs.domain}`);
  }

  if (attrs.maxAge !== undefined) {
    segments.push(`max-age=${Math.floor(attrs.maxAge)}`);
  }

  if (attrs.expires !== undefined) {
    const expiresDate =
      typeof attrs.expires === 'number'
        ? new Date(Date.now() + attrs.expires * 86_400_000)
        : attrs.expires;
    segments.push(`expires=${expiresDate.toUTCString()}`);
  }

  if (attrs.secure) {
    segments.push('secure');
  }

  if (attrs.sameSite) {
    segments.push(`samesite=${attrs.sameSite}`);
  }

  document.cookie = segments.join('; ');
}

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const cookieStore = (window as WindowWithCookieStore).cookieStore;

  window.addEventListener(CUSTOM_COOKIE_EVENT, onStoreChange);
  cookieStore?.addEventListener('change', onStoreChange);

  return () => {
    window.removeEventListener(CUSTOM_COOKIE_EVENT, onStoreChange);
    cookieStore?.removeEventListener('change', onStoreChange);
  };
}

export function useCookie(
  name: string,
  options: UseCookieOptions = {},
): [
  string | null,
  (value: string, attrs?: CookieAttributes) => void,
  (attrs?: CookieAttributes) => void,
] {
  const { defaultValue = null, ...defaultAttrs } = options;

  const getSnapshot = useCallback((): string | null => {
    if (typeof document === 'undefined') {
      return defaultValue;
    }
    return readCookieFromDocument(name) ?? defaultValue;
  }, [name, defaultValue]);

  const getServerSnapshot = useCallback((): string | null => {
    return defaultValue;
  }, [defaultValue]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setCookie = useEventCallback(
    (nextValue: string, overrideAttrs?: CookieAttributes) => {
      if (typeof document === 'undefined') {
        return;
      }

      writeCookieToDocument(name, nextValue, {
        ...defaultAttrs,
        ...overrideAttrs,
      });

      window.dispatchEvent(new Event(CUSTOM_COOKIE_EVENT));
    },
  );

  const deleteCookie = useEventCallback((overrideAttrs?: CookieAttributes) => {
    if (typeof document === 'undefined') {
      return;
    }

    writeCookieToDocument(name, '', {
      ...defaultAttrs,
      ...overrideAttrs,
      maxAge: 0,
      expires: new Date(0),
    });

    window.dispatchEvent(new Event(CUSTOM_COOKIE_EVENT));
  });

  return [value, setCookie, deleteCookie];
}
