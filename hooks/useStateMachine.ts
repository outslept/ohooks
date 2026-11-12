import { useRef, useState } from 'react';
import { useEventCallback } from './useEventCallback';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

export type StateTransitionTarget<
  TState extends string,
  TContext = undefined,
> =
  | TState
  | {
      target: TState;
      guard?: (context: TContext) => boolean;
      action?: (context: TContext) => void;
    };

export interface StateNodeConfig<
  TState extends string,
  TEvent extends string,
  TContext = undefined,
> {
  on?: Partial<Record<TEvent, StateTransitionTarget<TState, TContext>>>;
  onEnter?: (prevState: TState, event: TEvent) => void;
  onExit?: (nextState: TState, event: TEvent) => void;
}

export interface StateMachineConfig<
  TState extends string,
  TEvent extends string,
  TContext = undefined,
> {
  initial: TState;
  context?: TContext;
  states: Record<TState, StateNodeConfig<TState, TEvent, TContext>>;
  onTransition?: (
    nextState: TState,
    prevState: TState,
    event: TEvent,
  ) => void;
}

export interface UseStateMachineReturn<
  TState extends string,
  TEvent extends string,
> {
  state: TState;
  send: (event: TEvent) => boolean;
  can: (event: TEvent) => boolean;
  matches: (...candidates: ReadonlyArray<TState>) => boolean;
  reset: () => void;
}

export function useStateMachine<
  TState extends string,
  TEvent extends string,
  TContext = undefined,
>(
  config: StateMachineConfig<TState, TEvent, TContext>,
): UseStateMachineReturn<TState, TEvent> {
  const [state, setState] = useState<TState>(config.initial);
  const stateRef = useRef<TState>(state);

  useIsomorphicLayoutEffect(() => {
    stateRef.current = state;
  });

  const resolveTransition = (
    fromState: TState,
    event: TEvent,
  ): {
    target: TState;
    action?: (context: TContext) => void;
  } | null => {
    const node = config.states[fromState];
    const transition = node?.on?.[event];
    if (transition === undefined) {
      return null;
    }

    const ctx = config.context as TContext;

    if (typeof transition === 'string') {
      return { target: transition };
    }

    if (transition.guard && !transition.guard(ctx)) {
      return null;
    }

    return {
      target: transition.target,
      action: transition.action,
    };
  };

  const can = useEventCallback((event: TEvent): boolean => {
    return resolveTransition(stateRef.current, event) !== null;
  });

  const send = useEventCallback((event: TEvent): boolean => {
    const current = stateRef.current;
    const resolved = resolveTransition(current, event);
    if (!resolved) {
      return false;
    }

    const { target: nextState, action } = resolved;
    const ctx = config.context as TContext;

    if (nextState !== current) {
      config.states[current]?.onExit?.(nextState, event);
    }

    action?.(ctx);

    if (nextState !== current) {
      stateRef.current = nextState;
      setState(nextState);
      config.states[nextState]?.onEnter?.(current, event);
    }

    config.onTransition?.(nextState, current, event);
    return true;
  });

  const matches = useEventCallback(
    (...candidates: ReadonlyArray<TState>): boolean => {
      return candidates.includes(state);
    },
  );

  const reset = useEventCallback(() => {
    if (stateRef.current === config.initial) {
      return;
    }
    stateRef.current = config.initial;
    setState(config.initial);
  });

  return {
    state,
    send,
    can,
    matches,
    reset,
  };
}
