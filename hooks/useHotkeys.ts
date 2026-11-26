import { useEffect } from "react";
import { EventListenerTarget } from "./useEventListener";
import { useLatest } from "./useLatest";
import { resolveTargetElement } from "@/lib/utils";

export type HotkeyCallback = (event: KeyboardEvent, combo: string) => void;

export interface UseHotkeysOptions {
  /** Whether the hotkey listener is active (default: `true`) */
  enabled?: boolean;
  /** Call `event.preventDefault()` when a matching hotkey is pressed (default: `true`) */
  preventDefault?: boolean;
  /** Call `event.stopPropagation()` when a matching hotkey is pressed (default: `false`) */
  stopPropagation?: boolean;
  /** Allow hotkeys to trigger while focus is inside `<input>`, `<textarea>`, `<select>`, or `contentEditable` elements (default: `false`) */
  enableOnFormTags?: boolean;
  /** Keyboard event type to listen for (default: `'keydown'`) */
  event?: "keydown" | "keyup";
  /** Target element, document, or window to attach the listener to (default: `window`) */
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
  esc: "escape",
  return: "enter",
  space: " ",
  spacebar: " ",
  up: "arrowup",
  down: "arrowdown",
  left: "arrowleft",
  right: "arrowright",
  del: "delete",
  ins: "insert",
  plus: "+",
};

const MODIFIER_EVENT_KEYS = new Set(["control", "shift", "alt", "meta"]);

function isMacPlatform(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }
  return /Mac|iPod|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);
}

function normalizeKeyName(key: string): string {
  const lower = key.toLowerCase();
  return KEY_ALIASES[lower] ?? lower;
}

function tokenizeCombo(combo: string): string[] {
  const trimmed = combo.trim().toLowerCase();
  if (!trimmed) return [];
  if (trimmed === "+") return ["+"];

  const hasTrailingPlusKey = trimmed.endsWith("++");
  const body = hasTrailingPlusKey ? trimmed.slice(0, -2) : trimmed;
  const tokens = body
    .split("+")
    .map((part) => part.trim())
    .filter(Boolean);

  if (hasTrailingPlusKey) {
    tokens.push("+");
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
      case "ctrl":
      case "control":
        parsed.ctrl = true;
        break;
      case "shift":
        parsed.shift = true;
        break;
      case "alt":
      case "option":
        parsed.alt = true;
        break;
      case "meta":
      case "cmd":
      case "command":
      case "win":
      case "super":
        parsed.meta = true;
        break;
      case "mod":
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
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select"
  );
}

export function matchesHotkey(
  hotkey: string | ParsedHotkey,
  event: KeyboardEvent,
  isMac: boolean = isMacPlatform(),
): boolean {
  const parsed = typeof hotkey === "string" ? parseHotkey(hotkey) : hotkey;
  const expectCtrl = parsed.ctrl || (parsed.mod && !isMac);
  const expectMeta = parsed.meta || (parsed.mod && isMac);

  if (event.ctrlKey !== expectCtrl) return false;
  if (event.metaKey !== expectMeta) return false;
  if (event.shiftKey !== parsed.shift) return false;
  if (event.altKey !== parsed.alt) return false;

  const eventKey = normalizeKeyName(event.key);

  if (parsed.key === null) {
    const hasAnyModifier = expectCtrl || expectMeta || parsed.shift || parsed.alt;
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

/**
 * Listens for keyboard shortcut combinations (including cross-platform `mod` support) and invokes a callback when matched.
 *
 * @category Sensors
 * @param keys - Hotkey combination string (comma-separated) or array of combinations (e.g., `'mod+k, ctrl+shift+p'`)
 * @param callback - Function invoked when any of the specified key combinations is pressed
 * @param options - Configuration for form tag filtering, `preventDefault`, event type, and target element
 *
 * @example
 * ```tsx
 * useHotkeys('mod+k', () => {
 *   setCommandPaletteOpen(true);
 * });
 * ```
 */
export function useHotkeys(
  keys: string | readonly string[],
  callback: HotkeyCallback,
  options: UseHotkeysOptions = {},
): void {
  const {
    enabled = true,
    preventDefault = true,
    stopPropagation = false,
    enableOnFormTags = false,
    event: eventType = "keydown",
    target,
  } = options;

  const callbackRef = useLatest(callback);
  const keysString = Array.isArray(keys) ? keys.join(",") : (keys as string);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    const targetNode = resolveTargetElement<HTMLElement | Document | Window>(target, window);
    if (!targetNode) {
      return;
    }

    const combos = keysString
      .split(",")
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
        if (matchesHotkey(parsed, keyboardEvent, isMac)) {
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
