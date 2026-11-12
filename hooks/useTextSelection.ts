import { useState } from 'react';
import { useEventCallback } from './useEventCallback';
import {
  type EventListenerTarget,
  useEventListener,
} from './useEventListener';

export interface TextSelectionState {
  text: string;
  rect: DOMRect | null;
  rects: DOMRect[];
  ranges: Range[];
  selection: Selection | null;
}

const INITIAL_SELECTION_STATE: TextSelectionState = {
  text: '',
  rect: null,
  rects: [],
  ranges: [],
  selection: null,
};

function resolveElement<T extends Node>(
  target?: EventListenerTarget<T>,
): T | null {
  if (!target) {
    return null;
  }
  if (typeof target === 'object' && 'current' in target) {
    return target.current;
  }
  return target;
}

export function useTextSelection<T extends HTMLElement = HTMLElement>(
  target?: EventListenerTarget<T>,
): TextSelectionState {
  const [state, setState] = useState<TextSelectionState>(
    INITIAL_SELECTION_STATE,
  );

  const updateSelection = useEventCallback(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.getSelection !== 'function'
    ) {
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setState((prev) =>
        prev.text === '' && prev.ranges.length === 0
          ? prev
          : INITIAL_SELECTION_STATE,
      );
      return;
    }

    const text = selection.toString();
    const element = resolveElement(target);

    if (element) {
      const anchorNode = selection.anchorNode;
      const focusNode = selection.focusNode;
      const isInside =
        anchorNode !== null &&
        focusNode !== null &&
        element.contains(anchorNode) &&
        element.contains(focusNode);

      if (!isInside) {
        setState((prev) =>
          prev.text === '' && prev.ranges.length === 0
            ? prev
            : INITIAL_SELECTION_STATE,
        );
        return;
      }
    }

    if (!text) {
      setState((prev) =>
        prev.text === '' && prev.ranges.length === 0
          ? prev
          : INITIAL_SELECTION_STATE,
      );
      return;
    }

    const ranges: Range[] = [];
    const rects: DOMRect[] = [];

    for (let i = 0; i < selection.rangeCount; i++) {
      const range = selection.getRangeAt(i);
      ranges.push(range);
      rects.push(range.getBoundingClientRect());
    }

    setState({
      text,
      rect: rects[0] ?? null,
      rects,
      ranges,
      selection,
    });
  });

  const doc = typeof document !== 'undefined' ? document : null;

  useEventListener('selectionchange', updateSelection, doc);
  useEventListener('mouseup', updateSelection, doc);
  useEventListener('keyup', updateSelection, doc);

  return state;
}
