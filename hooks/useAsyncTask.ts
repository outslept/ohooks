import { useRef, useState } from "react";
import { useEventCallback } from "./useEventCallback";
import { useLatest } from "./useLatest";
import { useUnmount } from "./useUnmount";
import { useUnmountedRef } from "./useUnmountedRef";

export type AsyncTaskStatus = "idle" | "pending" | "success" | "error" | "aborted";

export interface AsyncTaskContext {
  /** Signal used to abort the in-flight task */
  signal: AbortSignal;
}

export interface UseAsyncTaskOptions<TResult> {
  /** Initial value for `data` before the first run (and after `reset`) */
  initialData?: TResult;
  /** Reset `data` back to `initialData` when a new run starts (default: `false`) */
  resetDataOnRun?: boolean;
  /** Callback invoked when the task resolves successfully */
  onSuccess?: (data: TResult) => void;
  /** Callback invoked when the task throws a non-abort error */
  onError?: (error: Error) => void;
  /** Callback invoked when the task is aborted */
  onAbort?: () => void;
}

export interface UseAsyncTaskReturn<TArgs extends unknown[], TResult> {
  /** Current execution status of the task */
  status: AsyncTaskStatus;
  /** Resolved data from the latest successful run */
  data: TResult | undefined;
  /** Error from the latest failed run, or `null` */
  error: Error | null;
  /** `true` when the task has not been run yet or was reset */
  isIdle: boolean;
  /** `true` while the task is currently executing */
  isPending: boolean;
  /** `true` when the latest run completed successfully */
  isSuccess: boolean;
  /** `true` when the latest run failed with an error */
  isError: boolean;
  /** `true` when the latest run was aborted */
  isAborted: boolean;
  /** Executes the task with the given arguments (aborts any in-flight run) */
  run: (...args: TArgs) => Promise<TResult | undefined>;
  /** Aborts the currently running task */
  abort: (reason?: unknown) => void;
  /** Aborts any in-flight run and resets state back to `idle` */
  reset: () => void;
}

function isAbortException(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name: unknown }).name === "AbortError"
  );
}

/**
 * Manages the manual execution, cancellation, and state of an asynchronous task with `AbortSignal` support.
 *
 * @category Async
 * @param task - Asynchronous function receiving an `AsyncTaskContext` (`{ signal }`) and custom arguments
 * @param options - Configuration options and lifecycle callbacks
 * @returns Task state flags, result data, error, and control methods (`run`, `abort`, `reset`)
 *
 * @example
 * ```tsx
 * const { run, abort, isPending, data } = useAsyncTask(
 *   async ({ signal }, id: string) => {
 *     const res = await fetch(`/api/users/${id}`, { signal });
 *     return res.json();
 *   },
 * );
 * ```
 */
export function useAsyncTask<TArgs extends unknown[], TResult>(
  task: (context: AsyncTaskContext, ...args: TArgs) => Promise<TResult>,
  options: UseAsyncTaskOptions<TResult> = {},
): UseAsyncTaskReturn<TArgs, TResult> {
  const { initialData, resetDataOnRun = false, onSuccess, onError, onAbort } = options;

  const [status, setStatus] = useState<AsyncTaskStatus>("idle");
  const [data, setData] = useState<TResult | undefined>(initialData);
  const [error, setError] = useState<Error | null>(null);

  const taskRef = useLatest(task);
  const onSuccessRef = useLatest(onSuccess);
  const onErrorRef = useLatest(onError);
  const onAbortRef = useLatest(onAbort);
  const unmountedRef = useUnmountedRef();

  const controllerRef = useRef<AbortController | null>(null);
  const callIdRef = useRef<number>(0);

  const run = useEventCallback(async (...args: TArgs): Promise<TResult | undefined> => {
    controllerRef.current?.abort();

    const controller = new AbortController();
    controllerRef.current = controller;
    const callId = ++callIdRef.current;

    if (!unmountedRef.current) {
      setStatus("pending");
      setError(null);
      if (resetDataOnRun) {
        setData(initialData);
      }
    }

    try {
      const result = await taskRef.current({ signal: controller.signal }, ...args);

      if (callId !== callIdRef.current || unmountedRef.current) {
        return undefined;
      }

      if (controller.signal.aborted) {
        controllerRef.current = null;
        setStatus("aborted");
        onAbortRef.current?.();
        return undefined;
      }

      controllerRef.current = null;
      setData(result);
      setStatus("success");
      onSuccessRef.current?.(result);
      return result;
    } catch (err) {
      if (callId !== callIdRef.current || unmountedRef.current) {
        return undefined;
      }

      controllerRef.current = null;

      if (controller.signal.aborted || isAbortException(err)) {
        setStatus("aborted");
        onAbortRef.current?.();
        return undefined;
      }

      const normalizedError = err instanceof Error ? err : new Error(String(err));
      setError(normalizedError);
      setStatus("error");
      onErrorRef.current?.(normalizedError);
      return undefined;
    }
  });

  const abort = useEventCallback((reason?: unknown) => {
    if (!controllerRef.current) {
      return;
    }

    callIdRef.current += 1;
    controllerRef.current.abort(reason);
    controllerRef.current = null;

    if (!unmountedRef.current) {
      setStatus("aborted");
      onAbortRef.current?.();
    }
  });

  const reset = useEventCallback(() => {
    callIdRef.current += 1;
    controllerRef.current?.abort();
    controllerRef.current = null;

    if (!unmountedRef.current) {
      setStatus("idle");
      setData(initialData);
      setError(null);
    }
  });

  useUnmount(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
  });

  return {
    status,
    data,
    error,
    isIdle: status === "idle",
    isPending: status === "pending",
    isSuccess: status === "success",
    isError: status === "error",
    isAborted: status === "aborted",
    run,
    abort,
    reset,
  };
}
