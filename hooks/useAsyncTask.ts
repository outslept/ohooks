import { useRef, useState } from 'react';
import { useEventCallback } from './useEventCallback';
import { useLatest } from './useLatest';
import { useUnmount } from './useUnmount';
import { useUnmountedRef } from './useUnmountedRef';

export type AsyncTaskStatus =
  | 'idle'
  | 'pending'
  | 'success'
  | 'error'
  | 'aborted';

export interface AsyncTaskContext {
  signal: AbortSignal;
}

export interface UseAsyncTaskOptions<TResult> {
  initialData?: TResult;
  resetDataOnRun?: boolean;
  onSuccess?: (data: TResult) => void;
  onError?: (error: Error) => void;
  onAbort?: () => void;
}

export interface UseAsyncTaskReturn<TArgs extends unknown[], TResult> {
  status: AsyncTaskStatus;
  data: TResult | undefined;
  error: Error | null;
  isIdle: boolean;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  isAborted: boolean;
  run: (...args: TArgs) => Promise<TResult | undefined>;
  abort: (reason?: unknown) => void;
  reset: () => void;
}

function isAbortException(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name: unknown }).name === 'AbortError'
  );
}

export function useAsyncTask<TArgs extends unknown[], TResult>(
  task: (context: AsyncTaskContext, ...args: TArgs) => Promise<TResult>,
  options: UseAsyncTaskOptions<TResult> = {},
): UseAsyncTaskReturn<TArgs, TResult> {
  const {
    initialData,
    resetDataOnRun = false,
    onSuccess,
    onError,
    onAbort,
  } = options;

  const [status, setStatus] = useState<AsyncTaskStatus>('idle');
  const [data, setData] = useState<TResult | undefined>(initialData);
  const [error, setError] = useState<Error | null>(null);

  const taskRef = useLatest(task);
  const onSuccessRef = useLatest(onSuccess);
  const onErrorRef = useLatest(onError);
  const onAbortRef = useLatest(onAbort);
  const unmountedRef = useUnmountedRef();

  const controllerRef = useRef<AbortController | null>(null);
  const callIdRef = useRef<number>(0);

  const run = useEventCallback(
    async (...args: TArgs): Promise<TResult | undefined> => {
      controllerRef.current?.abort();

      const controller = new AbortController();
      controllerRef.current = controller;
      const callId = ++callIdRef.current;

      if (!unmountedRef.current) {
        setStatus('pending');
        setError(null);
        if (resetDataOnRun) {
          setData(initialData);
        }
      }

      try {
        const result = await taskRef.current(
          { signal: controller.signal },
          ...args,
        );

        if (callId !== callIdRef.current || unmountedRef.current) {
          return undefined;
        }

        if (controller.signal.aborted) {
          controllerRef.current = null;
          setStatus('aborted');
          onAbortRef.current?.();
          return undefined;
        }

        controllerRef.current = null;
        setData(result);
        setStatus('success');
        onSuccessRef.current?.(result);
        return result;
      } catch (err) {
        if (callId !== callIdRef.current || unmountedRef.current) {
          return undefined;
        }

        controllerRef.current = null;

        if (controller.signal.aborted || isAbortException(err)) {
          setStatus('aborted');
          onAbortRef.current?.();
          return undefined;
        }

        const normalizedError =
          err instanceof Error ? err : new Error(String(err));
        setError(normalizedError);
        setStatus('error');
        onErrorRef.current?.(normalizedError);
        return undefined;
      }
    },
  );

  const abort = useEventCallback((reason?: unknown) => {
    if (!controllerRef.current) {
      return;
    }

    callIdRef.current += 1;
    controllerRef.current.abort(reason);
    controllerRef.current = null;

    if (!unmountedRef.current) {
      setStatus('aborted');
      onAbortRef.current?.();
    }
  });

  const reset = useEventCallback(() => {
    callIdRef.current += 1;
    controllerRef.current?.abort();
    controllerRef.current = null;

    if (!unmountedRef.current) {
      setStatus('idle');
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
    isIdle: status === 'idle',
    isPending: status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error',
    isAborted: status === 'aborted',
    run,
    abort,
    reset,
  };
}
