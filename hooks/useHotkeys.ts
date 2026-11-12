import {
  type EventListenerTarget,
  useEventListener,
} from './useEventListener';

export interface UseHotkeysOptions {
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  enableOnFormTags?: boolean;
  enableOnContentEditable?: boolean;
  ignoreRepeated?: boolean;
  event?: 'keydown' | 'keyup';
  target?: EventListenerTarget<EventTarget>;
}

interface ParsedHotkey {
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
  mod: boolean;
  key: string | null;
}

const KEY_ALIASES: Record<string, string> = {
  esc: 'escape',
  return: 'enter',
  space: ' ',
  spacebar: ' ',
  up: 'arrowup',
  down: 'arrowdown',
  left: 'arrowleft',
  right: 'arrowright',
  del: 'delete',
  ins: 'insert',
  pgup: 'pageup',
  pgdn: 'pagedown',
  plus: '+',
};

const FORM_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

function normalizeKey(rawKey: string): string {
  const lower = rawKey.trim().toLowerCase();
  return KEY_ALIASES[lower] ?? lower;
}

function parseHotkey(hotkey: string): ParsedHotkey {
  const tokens = hotkey
    .toLowerCase()
    .split('+')
    .map((part) => part.trim())
    .filter(Boolean);

  const parsed: ParsedHotkey = {
    ctrl: false,
    shift: false,
    alt: false,
    meta: false,
    mod: false,
    key: null,
  };

  for (const token of tokens) {
    if (token === 'ctrl' || token === 'control') {
      parsed.ctrl = true;
    } else if (token === 'shift') {
      parsed.shift = true;
    } else if (token === 'alt' || token === 'option') {
      parsed.alt = true;
    } else if (
      token === 'meta' ||
      token === 'cmd' ||
      token === 'command' ||
      token === 'win' ||
      token === 'super'
    ) {
      parsed.meta = true;
    } else if (token === 'mod') {
      parsed.mod = true;
    } else {
      parsed.key = normalizeKey(token);
    }
  }

  return parsed;
}

function isMacPlatform(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform);
}

function matchesEventKey(expectedKey: string, event: KeyboardEvent): boolean {
  const eventKey = normalizeKey(event.key);
  if (eventKey === expectedKey) {
    return true;
  }

  if (event.code) {
    const codeLower = event.code.toLowerCase();
    if (codeLower === expectedKey) {
      return true;
    }
    if (
      codeLower.startsWith('key') &&
      codeLower.slice(3) === expectedKey
    ) {
      return true;
    }
    if (
      codeLower.startsWith('digit') &&
      codeLower.slice(5) === expectedKey
    ) {
      return true;
    }
  }

  return false;
}

export function matchesHotkey(
  hotkey: string,
  event: KeyboardEvent,
): boolean {
  const parsed = parseHotkey(hotkey);
  const isMac = isMacPlatform();

  const expectedCtrl = parsed.ctrl || (!isMac && parsed.mod);
  const expectedMeta = parsed.meta || (isMac && parsed.mod);

  if (event.ctrlKey !== expectedCtrl) {
    return false;
  }
  if (event.metaKey !== expectedMeta) {
    return false;
  }
  if (event.shiftKey !== parsed.shift) {
    return false;
  }
  if (event.altKey !== parsed.alt) {
    return false;
  }

  if (parsed.key === null) {
    return true;
  }

  return matchesEventKey(parsed.key, event);
}

function isEditableElement(target: EventTarget | null): {
  isFormTag: boolean;
  isContentEditable: boolean;
} {
  if (!target || !(target instanceof HTMLElement)) {
    return { isFormTag: false, isContentEditable: false };
  }

  return {
    isFormTag: FORM_TAGS.has(target.tagName),
    isContentEditable: target.isContentEditable,
  };
}

export function useHotkeys(
  keys: string | ReadonlyArray<string>,
  callback: (event: KeyboardEvent, hotkey: string) => void,
  options: UseHotkeysOptions = {},
): void {
  const {
    enabled = true,
    preventDefault = false,
    stopPropagation = false,
    enableOnFormTags = false,
    enableOnContentEditable = false,
    ignoreRepeated = true,
    event: eventName = 'keydown',
    target,
  } = options;

  useEventListener(
    eventName,
    (event: Event) => {
      if (!enabled || !(event instanceof KeyboardEvent)) {
        return;
      }

      if (ignoreRepeated && event.repeat) {
        return;
      }

      const { isFormTag, isContentEditable } = isEditableElement(
        event.target,
      );

      if (isFormTag && !enableOnFormTags) {
        return;
      }

      if (isContentEditable && !enableOnContentEditable) {
        return;
      }

      const rawList = typeof keys === 'string' ? keys.split(',') : keys;
      const hotkeys = rawList
        .map((k: string) => k.trim())
        .filter(Boolean);

      for (const hotkey of hotkeys) {
        if (matchesHotkey(hotkey, event)) {
          if (preventDefault) {
            event.preventDefault();
          }
          if (stopPropagation) {
            event.stopPropagation();
          }
          callback(event, hotkey);
          break;
        }
      }
    },
    target,
  );
}
