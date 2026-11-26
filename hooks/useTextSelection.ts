import { useEffect, useState } from "react";
import { EventListenerTarget } from "./useEventListener";
import { resolveTargetElement } from "@/lib/utils";

/** Reactive state representing the user's current DOM text selection. */
export interface TextSelectionState {
  /** Currently selected plain text string. */
  text: string;
  /** Bounding client rectangle of the primary selection range, or `null` when empty. */
  rect: DOMRect | null;
  /** Cloned `Range` objects comprising the current selection. */
  ranges: Range[];
  /** Underlying browser `Selection` object, or `null` when empty. */
  selection: Selection | null;
}

const EMPTY_STATE: TextSelectionState = {
  text: "",
  rect: null,
  ranges: [],
  selection: null,
};

function isSameRect(a: DOMRect | null, b: DOMRect | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height;
}

function isSameRanges(a: Range[], b: Range[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    const rA = a[i];
    const rB = b[i];
    if (
      !rA ||
      !rB ||
      rA.startContainer !== rB.startContainer ||
      rA.startOffset !== rB.startOffset ||
      rA.endContainer !== rB.endContainer ||
      rA.endOffset !== rB.endOffset
    ) {
      return false;
    }
  }
  return true;
}

function isSameSelectionState(prev: TextSelectionState, next: TextSelectionState): boolean {
  if (prev === next) return true;
  if (
    prev.text === "" &&
    next.text === "" &&
    prev.ranges.length === 0 &&
    next.ranges.length === 0
  ) {
    return true;
  }
  return (
    prev.text === next.text &&
    isSameRect(prev.rect, next.rect) &&
    isSameRanges(prev.ranges, next.ranges)
  );
}

/**
 * Tracks the user's current text selection, bounding rectangle, and ranges within the document or a target container.
 *
 * @category Sensors
 * @param target - Optional container element or ref to scope selection tracking to
 * @returns Current `TextSelectionState` (`text`, `rect`, `ranges`, `selection`)
 *
 * @example
 * ```tsx
 * const { text, rect } = useTextSelection();
 * ```
 */
export function useTextSelection(target?: EventListenerTarget<HTMLElement>): TextSelectionState {
  const [state, setState] = useState<TextSelectionState>(EMPTY_STATE);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const updateSelection = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setState((prev) => (isSameSelectionState(prev, EMPTY_STATE) ? prev : EMPTY_STATE));
        return;
      }

      const text = sel.toString();
      if (!text) {
        setState((prev) => (isSameSelectionState(prev, EMPTY_STATE) ? prev : EMPTY_STATE));
        return;
      }

      const containerElement = resolveTargetElement(target);
      if (containerElement) {
        const anchorNode = sel.anchorNode;
        const focusNode = sel.focusNode;
        const containsAnchor = anchorNode !== null && containerElement.contains(anchorNode);
        const containsFocus = focusNode !== null && containerElement.contains(focusNode);

        if (!containsAnchor && !containsFocus) {
          setState((prev) => (isSameSelectionState(prev, EMPTY_STATE) ? prev : EMPTY_STATE));
          return;
        }
      }

      const ranges: Range[] = [];
      for (let i = 0; i < sel.rangeCount; i += 1) {
        ranges.push(sel.getRangeAt(i).cloneRange());
      }

      const firstRange = ranges[0];
      const rect = firstRange ? firstRange.getBoundingClientRect() : null;

      const nextState: TextSelectionState = {
        text,
        rect,
        ranges,
        selection: sel,
      };

      setState((prev) => (isSameSelectionState(prev, nextState) ? prev : nextState));
    };

    document.addEventListener("selectionchange", updateSelection);
    window.addEventListener("mouseup", updateSelection);
    window.addEventListener("keyup", updateSelection);

    return () => {
      document.removeEventListener("selectionchange", updateSelection);
      window.removeEventListener("mouseup", updateSelection);
      window.removeEventListener("keyup", updateSelection);
    };
  }, [target]);

  return state;
}

export default useTextSelection;
