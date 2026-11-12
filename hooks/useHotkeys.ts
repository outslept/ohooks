import { useEffect } from 'react';
import {
  EventListenerTarget,
  resolveTargetElement,
} from './useEventListener';
import { useLatest } from './useLatest';

export type HotkeyCallback = (event: KeyboardEvent, combo: string) => void;

export interface UseHotkeysOptions {
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  enableOnFormTags?: boolean;
  event?: 'keydown' | 'keyup';
  target?: EventListenerTarget<HTMLElement | Document | Window>;
}

interface ParsedHotkey {
  raw: string;
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
  plus: '+',
};

const MODIFIER_EVENT_KEYS = new Set([
  'control',
  'shift',
  'alt',
  'meta',
]);

function isMacPlatform(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return /Mac|iPod|iPhone|iPad/i.test(
    navigator.platform || navigator.userAgent
  );
}

function normalizeKeyName(key: string): string {
  const lower = key.toLowerCase();
  return KEY_ALIASES[lower] ?? lower;
}

function tokenizeCombo(combo: string): string[] {
  const trimmed = combo.trim().toLowerCase();
  if (!trimmed) return [];
  if (trimmed === '+') return ['+'];

  const hasTrailingPlusKey = trimmed.endsWith('++');
  const body = hasTrailingPlusKey ? trimmed.slice(0, -2) : trimmed;
  const tokens = body
    .split('+')
    .map((part) => part.trim())
    .filter(Boolean);

  if (hasTrailingPlusKey) {
    tokens.push('+');
  }

  return tokens;
}

function parseHotkey(combo: string): ParsedHotkey {
  const tokens = tokenizeCombo(combo);

  const parsed: ParsedHotkey = {
    raw: combo.trim(),
    ctrl: false,
    shift: false,
    alt: false,
    meta: false,
    mod: false,
    key: null,
  };

  for (const token of tokens) {
    switch (token) {
      case 'ctrl':
      case 'control':
        parsed.ctrl = true;
        break;
      case 'shift':
        parsed.shift = true;
        break;
      case 'alt':
      case 'option':
        parsed.alt = true;
        break;
      case 'meta':
      case 'cmd':
      case 'command':
      case 'win':
      case 'super':
        parsed.meta = true;
        break;
      case 'mod':
        parsed.mod = true;
        break;
      default:
        parsed.key = normalizeKeyName(token);
        break;
    }
  }

  return parsed;
}

function isEditableElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) {
    return false;
  }
  const tagName = target.tagName.toLowerCase();
  return (
    target.isContentEditable ||
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select'
  );
}

function matchesHotkey(
  event: KeyboardEvent,
  parsed: ParsedHotkey,
  isMac: boolean
): boolean {
  const expectCtrl = parsed.ctrl || (parsed.mod && !isMac);
  const expectMeta = parsed.meta || (parsed.mod && isMac);

  if (event.ctrlKey !== expectCtrl) return false;
  if (event.metaKey !== expectMeta) return false;
  if (event.shiftKey !== parsed.shift) return false;
  if (event.altKey !== parsed.alt) return false;

  const eventKey = normalizeKeyName(event.key);

  if (parsed.key === null) {
    const hasAnyModifier =
      expectCtrl || expectMeta || parsed.shift || parsed.alt;
    return hasAnyModifier && MODIFIER_EVENT_KEYS.has(eventKey);
  }

  if (eventKey === parsed.key) {
    return true;
  }

  const code = event.code.toLowerCase();
  if (code === `key${parsed.key}` || code === `digit${parsed.key}`) {
    return true;
  }

  return false;
}

export function useHotkeys(
  keys: string | readonly string[],
  callback: HotkeyCallback,
  options: UseHotkeysOptions = {}
): void {
  const {
    enabled = true,
    preventDefault = true,
    stopPropagation = false,
    enableOnFormTags = false,
    event: eventType = 'keydown',
    target,
  } = options;

  const callbackRef = useLatest(callback);
  const keysString = Array.isArray(keys) ? keys.join(',') : (keys as string);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }

    const targetNode = resolveTargetElement<HTMLElement | Document | Window>(
      target,
      window
    );
    if (!targetNode) {
      return;
    }

    const combos = keysString
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)
      .map(parseHotkey);

    if (combos.length === 0) {
      return;
    }

    const isMac = isMacPlatform();

    const handleKeyEvent = (rawEvent: Event) => {
      const keyboardEvent = rawEvent as KeyboardEvent;

      if (!enableOnFormTags && isEditableElement(keyboardEvent.target)) {
        return;
      }

      for (const parsed of combos) {
        if (matchesHotkey(keyboardEvent, parsed, isMac)) {
          if (preventDefault) {
            keyboardEvent.preventDefault();
          }
          if (stopPropagation) {
            keyboardEvent.stopPropagation();
          }
          callbackRef.current(keyboardEvent, parsed.raw);
          break;
        }
      }
    };

    targetNode.addEventListener(eventType, handleKeyEvent);

    return () => {
      targetNode.removeEventListener(eventType, handleKeyEvent);
    };
  }, [
    enabled,
    keysString,
    preventDefault,
    stopPropagation,
    enableOnFormTags,
    eventType,
    target,
    callbackRef,
  ]);
}

export default useHotkeys;
