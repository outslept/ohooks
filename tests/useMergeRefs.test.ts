import { mergeRefs, useMergeRefs, type PossibleRef } from "@/hooks/useMergeRefs";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderHook } from "vitest-browser-react";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe("useMergeRefs", () => {
  it("attaches node to object and callback refs, detaches removed refs on rerender, and runs React 19 cleanups", async () => {
    const objRef1 = createRef<HTMLDivElement>();
    const objRef2 = createRef<HTMLDivElement>();
    const plainCbRef = vi.fn();
    const cleanupSpy = vi.fn();
    const cbRefWithCleanup = vi.fn(() => cleanupSpy);

    const { result, rerender, act } = await renderHook(
      (props?: { dynamicRef: PossibleRef<HTMLDivElement> }) =>
        useMergeRefs(props ? props.dynamicRef : objRef1, plainCbRef, cbRefWithCleanup),
    );

    const node = document.createElement("div");
    let unmountCleanup: (() => void) | void = undefined;

    await act(async () => {
      unmountCleanup = result.current(node);
    });

    expect(objRef1.current).toBe(node);
    expect(plainCbRef).toHaveBeenCalledWith(node);
    expect(cbRefWithCleanup).toHaveBeenCalledWith(node);

    await rerender({ dynamicRef: objRef2 });
    expect(objRef1.current).toBeNull();
    expect(objRef2.current).toBe(node);

    expect(unmountCleanup).toBeTypeOf("function");
    await act(async () => {
      (unmountCleanup as () => void)();
    });

    expect(objRef2.current).toBeNull();
    expect(plainCbRef).toHaveBeenLastCalledWith(null);
    expect(cleanupSpy).toHaveBeenCalledTimes(1);
  });

  it("mergeRefs utility handles null nodes, standard refs, and explicit React 19 cleanup functions", () => {
    const objRef = createRef<HTMLSpanElement>();
    const plainCb = vi.fn();
    const mergedStandard = mergeRefs(objRef, plainCb, null, undefined);

    const span = document.createElement("span");
    expect(mergedStandard(span)).toBeUndefined();
    expect(objRef.current).toBe(span);
    expect(plainCb).toHaveBeenCalledWith(span);

    mergedStandard(null);
    expect(objRef.current).toBeNull();
    expect(plainCb).toHaveBeenLastCalledWith(null);

    const explicitCleanup = vi.fn();
    const mergedWithCleanup = mergeRefs(objRef, () => explicitCleanup);
    const cleanupFn = mergedWithCleanup(span);
    expect(cleanupFn).toBeTypeOf("function");

    (cleanupFn as () => void)();
    expect(objRef.current).toBeNull();
    expect(explicitCleanup).toHaveBeenCalledTimes(1);
  });
});
