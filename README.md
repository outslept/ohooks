<p align="center">
  <a href="https://ohooks.vercel.app">
    <img width="96" height="96" alt="ohooks" src="./app/icon1.png">
  </a>
</p>

# ohooks

**88 React hooks you install as source, not as a dependency.**

`npx shadcn@latest add @ohooks/use-local-storage` drops `useLocalStorage.ts` into your project. You own the file: no package to upgrade, no wrapper around the browser API, nothing between you and the code except React.

[![Node 24+](https://img.shields.io/badge/node-%E2%89%A524-3c873a?logo=node.js&logoColor=white)](https://nodejs.org)
[![pnpm 11+](https://img.shields.io/badge/pnpm-%E2%89%A511.29-f69220?logo=pnpm&logoColor=white)](https://pnpm.io)
[![React 19](https://img.shields.io/badge/react-19-087ea4?logo=react&logoColor=white)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/license-MIT-000000)](./LICENSE)
[![Registry](https://img.shields.io/badge/registry-shadcn-000000)](https://ohooks.vercel.app/r/registry.json)

**Documentation** · [ohooks.vercel.app](https://ohooks.vercel.app) &nbsp;|&nbsp; **Registry** · [`/r/registry.json`](https://ohooks.vercel.app/r/registry.json) &nbsp;|&nbsp; **For LLMs** · [`/llms.txt`](https://ohooks.vercel.app/llms.txt)

---

## Contents

- [Why install as source](#why-install-as-source)
- [Quick start](#quick-start)
- [Usage](#usage)
- [What every hook guarantees](#what-every-hook-guarantees)
- [Hook catalog](#hook-catalog-88-hooks)
- [Registry endpoints](#registry-endpoints)
- [Local development](#local-development)
- [Testing](#testing)
- [Project structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Quick start

Requires an existing shadcn project (`components.json`). If you don't have one: `npx shadcn@latest init`.

### 1. Register the namespace

```bash
npx shadcn@latest registry add @ohooks=https://ohooks.vercel.app/r/{name}.json
```

One line is added to `components.json`. Nothing else in your project changes.

### 2. Install a hook

```bash
npx shadcn@latest add @ohooks/use-local-storage
```

`useLocalStorage.ts` appears in your hooks directory. Internal dependencies come with it - `useDarkMode` alone pulls six files:

```bash
npx shadcn@latest add @ohooks/use-dark-mode
# → hooks/useDarkMode.ts
#   hooks/useLocalStorage.ts
#   hooks/useMediaQuery.ts
#   hooks/useHydrated.ts
#   hooks/useEventListener.ts
#   hooks/useIsomorphicLayoutEffect.ts
#   lib/utils.ts
```

### 3. Use it

```tsx
import { useLocalStorage } from "@/hooks/useLocalStorage";

export function NameField() {
  const [name, setName] = useLocalStorage("name", "anonymous");
  return <input value={name} onChange={(e) => setName(e.target.value)} />;
}
```

### Other ways to install

```bash
# without the namespace - any hook is installable by URL
npx shadcn@latest add https://ohooks.vercel.app/r/use-local-storage.json

# browse and inspect before writing anything
npx shadcn@latest search @ohooks
npx shadcn@latest view @ohooks/use-idle

# everything at once (89 files) - for exploring, not for shipping
npx shadcn@latest add @ohooks/all
```

Every endpoint answers to both spellings: `/r/use-local-storage.json` and `/r/useLocalStorage.json` return the same payload.

## Usage

A few hooks in context, to show the shape of the API. Full signatures and live demos are on the [docs site](https://ohooks.vercel.app).

### State without a state library

```tsx
import { useBoolean } from "@/hooks/useBoolean";

const { value: open, toggle, setFalse } = useBoolean(false);
```

```tsx
import { useHistoryState } from "@/hooks/useHistoryState";

const { state, set, undo, redo, canUndo, canRedo } = useHistoryState(0, { capacity: 50 });
```

### Storage that syncs across tabs

```tsx
import { useLocalStorage } from "@/hooks/useLocalStorage";

const [theme, setTheme] = useLocalStorage<"light" | "dark">("theme", "light", {
  serializer: JSON.stringify,
});
```

### Observing the DOM

```tsx
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const sentinel = useRef<HTMLDivElement>(null);
const entry = useIntersectionObserver(sentinel, { rootMargin: "200px", freezeOnceVisible: true });

if (entry?.isIntersecting) loadNextPage();
```

```tsx
import { useElementSize } from "@/hooks/useElementSize";

const boxRef = useRef<HTMLDivElement>(null);
const { width, height } = useElementSize(boxRef, { box: "border-box" });

return (
  <div ref={boxRef}>
    {width} × {height}
  </div>
);
```

### Gestures and keyboard

```tsx
import { useHotkeys } from "@/hooks/useHotkeys";

useHotkeys("mod+k", (e) => {
  e.preventDefault();
  openSearch();
});
```

```tsx
import { useSwipe } from "@/hooks/useSwipe";

const panelRef = useRef<HTMLDivElement>(null);
const { isSwiping, direction, lengthX, lengthY } = useSwipe(panelRef, { threshold: 40 });
```

### Async work with cancellation

```tsx
import { useAsyncTask } from "@/hooks/useAsyncTask";

const { run, abort, reset, status, data, error, isPending } = useAsyncTask(
  async (url: string, signal: AbortSignal) => {
    const res = await fetch(url, { signal });
    return res.json();
  },
);

await run("/api/items"); // args are passed through to the task
```

## What every hook guarantees

- **SSR-safe.** No hook reads `window` or `document` during render or at module scope. Verified statically across all 88 files; hydration-sensitive hooks use `useSyncExternalStore` with a server snapshot.
- **Typed end to end.** Options and return types are exported interfaces, not inferred anonymous shapes. The repo compiles under `strict` with zero errors.
- **Documented in the file.** Every hook carries a JSDoc block with `@param`, `@returns`, `@example` and a category tag. That comment travels with the source you install.
- **Reference-counted where sharing matters.** `useInert`, `useLockBodyScroll` and `useScript` are safe to call from several components: the first acquires, the last releases.
- **No runtime dependency but React.** Nothing else is imported by any file in `hooks/`.
- **Cleaned up on unmount.** Every listener, observer, timer and animation frame is released - each suite asserts this with a spy, not by hoping.

## Hook catalog (88 hooks)

Every name links to its documentation page with the live demo, full source and options table.

### State (13)

| Hook                                                                       | Description                                                                                                                   |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| [`useBoolean`](https://ohooks.vercel.app/use-boolean)                      | Manages a boolean state with helper functions to set, reset, and toggle the value                                             |
| [`useControllableState`](https://ohooks.vercel.app/use-controllable-state) | Manages state that can be either controlled externally or uncontrolled with an internal fallback                              |
| [`useCounter`](https://ohooks.vercel.app/use-counter)                      | Manages a numeric counter state with optional min/max clamping and helper methods                                             |
| [`useHistoryState`](https://ohooks.vercel.app/use-history-state)           | Manages state with undo/redo history tracking and configurable history capacity                                               |
| [`useList`](https://ohooks.vercel.app/use-list)                            | Manages an array state with immutable helper methods for pushing, inserting, updating, removing, filtering, and sorting items |
| [`useMap`](https://ohooks.vercel.app/use-map)                              | Manages a reactive `Map` state with immutable helper actions for setting, deleting, clearing, and querying entries            |
| [`usePagination`](https://ohooks.vercel.app/use-pagination)                | Computes pagination state, page ranges with ellipsis markers, data slice indices, and navigation helpers                      |
| [`usePrevious`](https://ohooks.vercel.app/use-previous)                    | Returns the value passed on the previous render                                                                               |
| [`usePreviousDistinct`](https://ohooks.vercel.app/use-previous-distinct)   | Returns the most recent distinct value prior to the current value                                                             |
| [`useQueue`](https://ohooks.vercel.app/use-queue)                          | Manages a reactive FIFO (first-in, first-out) queue in React state                                                            |
| [`useSelection`](https://ohooks.vercel.app/use-selection)                  | Manages single or multi-item selection state with range selection and bulk toggle helpers                                     |
| [`useSet`](https://ohooks.vercel.app/use-set)                              | Manages a reactive `Set` in React state with immutable update helpers                                                         |
| [`useToggle`](https://ohooks.vercel.app/use-toggle)                        | Manages a boolean state with a `toggle` function that also accepts an explicit boolean or DOM event                           |

### Storage (5)

| Hook                                                                    | Description                                                                                                |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [`useCookie`](https://ohooks.vercel.app/use-cookie)                     | Reads, writes, and deletes a browser cookie reactively using `useSyncExternalStore`                        |
| [`useHash`](https://ohooks.vercel.app/use-hash)                         | Reads and updates `window.location.hash` reactively using `useSyncExternalStore`                           |
| [`useLocalStorage`](https://ohooks.vercel.app/use-local-storage)        | Persists and synchronizes state with `window.localStorage` across components and browser tabs              |
| [`useSessionStorage`](https://ohooks.vercel.app/use-session-storage)    | Persists reactive state in `window.sessionStorage` with automatic serialization and synchronization        |
| [`useUrlSearchParams`](https://ohooks.vercel.app/use-url-search-params) | Reads and updates `window.location.search` as reactive `URLSearchParams` synchronized with browser history |

### Browser (9)

| Hook                                                                     | Description                                                                                                                                     |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| [`useBeforeUnload`](https://ohooks.vercel.app/use-before-unload)         | Prompts the user with a confirmation dialog before leaving or reloading the page                                                                |
| [`useBroadcastChannel`](https://ohooks.vercel.app/use-broadcast-channel) | Communicates between browser tabs, windows, or iframes of the same origin using the `BroadcastChannel` API                                      |
| [`useCopyToClipboard`](https://ohooks.vercel.app/use-copy-to-clipboard)  | Copies text to the system clipboard and tracks the copied state with an optional auto-reset timer                                               |
| [`useDarkMode`](https://ohooks.vercel.app/use-dark-mode)                 | Manages dark mode state with system preference detection, `localStorage` persistence, and automatic DOM class toggling                          |
| [`useFileDialog`](https://ohooks.vercel.app/use-file-dialog)             | Opens the native file selection dialog programmatically without rendering a visible `<input type="file">` element                               |
| [`useFullscreen`](https://ohooks.vercel.app/use-fullscreen)              | Manages fullscreen state for a target DOM element (or `document.documentElement`) with vendor prefix support                                    |
| [`useObjectUrl`](https://ohooks.vercel.app/use-object-url)               | Creates a temporary object URL (`URL.createObjectURL`) for a `Blob`, `File`, or `MediaSource` and automatically revokes it on change or unmount |
| [`usePermission`](https://ohooks.vercel.app/use-permission)              | Queries and subscribes to browser permission status changes via `navigator.permissions.query`                                                   |
| [`useWakeLock`](https://ohooks.vercel.app/use-wake-lock)                 | Prevents the device screen from dimming or locking using the Screen Wake Lock API                                                               |

### Dom (23)

| Hook                                                                             | Description                                                                                                                                                |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`useDocumentTitle`](https://ohooks.vercel.app/use-document-title)               | Updates `document.title` reactively and optionally restores the original title on unmount                                                                  |
| [`useDropZone`](https://ohooks.vercel.app/use-drop-zone)                         | Handles file drag-and-drop interactions with MIME/extension filtering via a target ref or `getRootProps`                                                   |
| [`useElementRef`](https://ohooks.vercel.app/use-element-ref)                     | Provides a callback ref and reactive state for the mounted DOM element so effects re-run when the node attaches or detaches                                |
| [`useElementScroll`](https://ohooks.vercel.app/use-element-scroll)               | Tracks a scrollable element's scroll position, active scrolling state, movement directions, and edge arrival flags                                         |
| [`useElementSize`](https://ohooks.vercel.app/use-element-size)                   | Tracks the width and height of a DOM element reactively using `ResizeObserver`                                                                             |
| [`useEventListener`](https://ohooks.vercel.app/use-event-listener)               | Attaches a type-safe event listener to `Window`, `Document`, `HTMLElement`, `SVGElement`, `MediaQueryList`, or custom `EventTarget` with automatic cleanup |
| [`useFocus`](https://ohooks.vercel.app/use-focus)                                | Tracks and controls the focus state of a target DOM element, with optional `:focus-visible` filtering                                                      |
| [`useFocusTrap`](https://ohooks.vercel.app/use-focus-trap)                       | Traps keyboard `Tab` / `Shift+Tab` focus within a container element and optionally restores focus on unmount                                               |
| [`useInert`](https://ohooks.vercel.app/use-inert)                                | Manages the `inert` and `aria-hidden` attributes on a target element (or its document-level siblings) with reference counting                              |
| [`useInfiniteScroll`](https://ohooks.vercel.app/use-infinite-scroll)             | Triggers an asynchronous `onLoadMore` callback when a sentinel element scrolls into view using `IntersectionObserver`                                      |
| [`useIntersectionObserver`](https://ohooks.vercel.app/use-intersection-observer) | Observes changes in the intersection of a target DOM element with an ancestor element or the viewport                                                      |
| [`useLockBodyScroll`](https://ohooks.vercel.app/use-lock-body-scroll)            | Locks scrolling on `document.body` (or a target element) with scrollbar gap compensation and reference counting across multiple active locks               |
| [`useMeasure`](https://ohooks.vercel.app/use-measure)                            | Measures the dimensions and box insets of a DOM element via a callback ref and `ResizeObserver`                                                            |
| [`useMergeRefs`](https://ohooks.vercel.app/use-merge-refs)                       | Combines multiple React refs (callback refs, `RefObject`s, or `null`/`undefined`) into a single stable callback ref with React 19 cleanup support          |
| [`useMutationObserver`](https://ohooks.vercel.app/use-mutation-observer)         | Observes DOM tree, attribute, or character data mutations on a target node using `MutationObserver`                                                        |
| [`useOnClickOutside`](https://ohooks.vercel.app/use-on-click-outside)            | Invokes a handler when a pointer, mouse, or touch interaction occurs outside one or more target elements (with Shadow DOM `composedPath` support)          |
| [`useResizeObserver`](https://ohooks.vercel.app/use-resize-observer)             | Observes size changes on a target DOM element using the `ResizeObserver` API                                                                               |
| [`useRovingTabIndex`](https://ohooks.vercel.app/use-roving-tab-index)            | Implements the WAI-ARIA roving `tabIndex` keyboard navigation pattern for composite widgets                                                                |
| [`useScript`](https://ohooks.vercel.app/use-script)                              | Dynamically loads an external `<script>` tag, deduplicating across components and tracking its status                                                      |
| [`useScrollSpy`](https://ohooks.vercel.app/use-scroll-spy)                       | Observes a list of page sections and returns the `id` of the currently active section in view                                                              |
| [`useTextareaAutosize`](https://ohooks.vercel.app/use-textarea-autosize)         | Automatically adjusts the height of a `<textarea>` element to fit its content                                                                              |
| [`useVirtualList`](https://ohooks.vercel.app/use-virtual-list)                   | Virtualizes a large list of fixed or variable-height items so only visible rows are rendered                                                               |
| [`useVisualViewport`](https://ohooks.vercel.app/use-visual-viewport)             | Tracks the browser's `VisualViewport` dimensions, offsets, and pinch-zoom scale (useful for virtual keyboards)                                             |

### Sensors (19)

| Hook                                                                         | Description                                                                                                                                        |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`useDevicePixelRatio`](https://ohooks.vercel.app/use-device-pixel-ratio)    | Tracks the current `window.devicePixelRatio` reactively across screen changes and browser zoom levels                                              |
| [`useDocumentVisibility`](https://ohooks.vercel.app/use-document-visibility) | Tracks the current `document.visibilityState` (`'visible'` or `'hidden'`) using `useSyncExternalStore`                                             |
| [`useGeolocation`](https://ohooks.vercel.app/use-geolocation)                | Watches the user's geographic location reactively using `navigator.geolocation.watchPosition`                                                      |
| [`useHotkeys`](https://ohooks.vercel.app/use-hotkeys)                        | Listens for keyboard shortcut combinations (including cross-platform `mod` support) and invokes a callback when matched                            |
| [`useHover`](https://ohooks.vercel.app/use-hover)                            | Tracks whether the pointer is hovering over a target DOM element, with optional enter and leave delays                                             |
| [`useIdle`](https://ohooks.vercel.app/use-idle)                              | Tracks whether the user has been inactive for a given duration by listening to window interaction events                                           |
| [`useKeyPress`](https://ohooks.vercel.app/use-key-press)                     | Tracks whether a specific key, hotkey combination, or custom key predicate is currently held down                                                  |
| [`useLongPress`](https://ohooks.vercel.app/use-long-press)                   | Detects long-press pointer gestures with movement threshold cancellation and click suppression                                                     |
| [`useMediaQuery`](https://ohooks.vercel.app/use-media-query)                 | Evaluates a CSS media query string and subscribes to changes reactively using `useSyncExternalStore`                                               |
| [`useMouse`](https://ohooks.vercel.app/use-mouse)                            | Tracks mouse cursor coordinates across the document, viewport, screen, and an optional target element using `requestAnimationFrame`                |
| [`useNetworkInformation`](https://ohooks.vercel.app/use-network-information) | Tracks network connectivity status and connection quality metrics (`effectiveType`, `downlink`, `rtt`, `saveData`) via the Network Information API |
| [`useOnline`](https://ohooks.vercel.app/use-online)                          | Tracks whether the browser is currently connected to the network (`navigator.onLine`) using `useSyncExternalStore`                                 |
| [`usePointerDrag`](https://ohooks.vercel.app/use-pointer-drag)               | Tracks pointer drag gestures on a target element with axis locking and movement thresholds                                                         |
| [`usePreferredLanguage`](https://ohooks.vercel.app/use-preferred-language)   | Tracks the user's preferred browser language (`navigator.language`) and updates on changes                                                         |
| [`useScreenOrientation`](https://ohooks.vercel.app/use-screen-orientation)   | Tracks the device screen orientation and provides `lock` and `unlock` controls                                                                     |
| [`useSwipe`](https://ohooks.vercel.app/use-swipe)                            | Detects pointer swipe gestures and directions on a target element                                                                                  |
| [`useTextSelection`](https://ohooks.vercel.app/use-text-selection)           | Tracks the user's current text selection, bounding rectangle, and ranges within the document or a target container                                 |
| [`useWindowScroll`](https://ohooks.vercel.app/use-window-scroll)             | Tracks the window scroll position (`x`, `y`) and provides a `scrollTo` helper                                                                      |
| [`useWindowSize`](https://ohooks.vercel.app/use-window-size)                 | Tracks the browser window's `innerWidth` and `innerHeight` on resize                                                                               |

### Effects (18)

| Hook                                                                                  | Description                                                                                                                           |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| [`useAnimationFrame`](https://ohooks.vercel.app/use-animation-frame)                  | Runs a callback on every `requestAnimationFrame` tick with delta time tracking, FPS limiting, and playback controls                   |
| [`useCountdown`](https://ohooks.vercel.app/use-countdown)                             | Manages a configurable countdown (or count-up) timer with start, pause, and reset controls                                            |
| [`useDebounceCallback`](https://ohooks.vercel.app/use-debounce-callback)              | Creates a debounced version of a callback function with `leading`, `trailing`, `maxWait`, `cancel`, and `flush` support               |
| [`useDebounceValue`](https://ohooks.vercel.app/use-debounce-value)                    | Debounces a reactive value and provides a debounced setter with `.cancel()`, `.flush()`, and `.isPending()` controls                  |
| [`useEventCallback`](https://ohooks.vercel.app/use-event-callback)                    | Returns a referentially stable callback that always invokes the latest version of `fn`                                                |
| [`useFirstMountState`](https://ohooks.vercel.app/use-first-mount-state)               | Returns `true` during the initial render of a component and `false` on all subsequent renders                                         |
| [`useHydrated`](https://ohooks.vercel.app/use-hydrated)                               | Returns `false` during server-side rendering and initial hydration, and `true` once hydrated on the client                            |
| [`useInterval`](https://ohooks.vercel.app/use-interval)                               | Runs a callback repeatedly at a specified millisecond interval, pausing when `delay` is `null`                                        |
| [`useIsomorphicLayoutEffect`](https://ohooks.vercel.app/use-isomorphic-layout-effect) | Uses `useLayoutEffect` in browser environments and falls back to `useEffect` during server-side rendering to avoid React SSR warnings |
| [`useLatest`](https://ohooks.vercel.app/use-latest)                                   | Returns a ref object whose `.current` property is synchronously updated to the latest value after every render                        |
| [`useRafCallback`](https://ohooks.vercel.app/use-raf-callback)                        | Throttles a callback so it executes at most once per `requestAnimationFrame` with the latest arguments                                |
| [`useSpinDelay`](https://ohooks.vercel.app/use-spin-delay)                            | Prevents loading indicator flashes by delaying appearance and enforcing a minimum display duration                                    |
| [`useThrottleCallback`](https://ohooks.vercel.app/use-throttle-callback)              | Creates a throttled version of a callback that executes at most once every `wait` milliseconds                                        |
| [`useThrottleValue`](https://ohooks.vercel.app/use-throttle-value)                    | Throttles state updates to a value so it changes at most once per `wait` milliseconds                                                 |
| [`useTimeout`](https://ohooks.vercel.app/use-timeout)                                 | Declarative `setTimeout` hook that invokes a callback after `delay` milliseconds                                                      |
| [`useUnmount`](https://ohooks.vercel.app/use-unmount)                                 | Executes a cleanup callback when the component unmounts, always using the latest function reference                                   |
| [`useUnmountedRef`](https://ohooks.vercel.app/use-unmounted-ref)                      | Returns a read-only ref whose `current` value is `true` after the component has unmounted                                             |
| [`useUpdateEffect`](https://ohooks.vercel.app/use-update-effect)                      | Runs a `useEffect` callback only on dependency updates, skipping the initial mount                                                    |

### Async (1)

| Hook                                                       | Description                                                                                              |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [`useAsyncTask`](https://ohooks.vercel.app/use-async-task) | Manages the manual execution, cancellation, and state of an asynchronous task with `AbortSignal` support |

## Registry endpoints

The docs site, the shadcn CLI and LLM agents all read from the same routes.

| Route              | Returns                                                                      |
| ------------------ | ---------------------------------------------------------------------------- |
| `/r/registry.json` | Full catalog - 90 items, used by `shadcn list` and `search`                  |
| `/r/<hook>.json`   | One `registry:hook` payload with source inlined; `camelCase` or `kebab-case` |
| `/r/all.json`      | Everything: 89 files, ~325 KB                                                |
| `/llms.txt`        | Markdown index of every documentation page                                   |
| `/llms-full.txt`   | Entire documentation corpus in one file                                      |
| `/<page>.md`       | Raw Markdown of any documentation page                                       |

Requests carrying `Accept: application/vnd.shadcn.v1+json` or a `shadcn` user agent are served JSON; browsers get HTML. A `Vary` header keeps caches honest.

## Local development

```bash
pnpm install
pnpm dev
```

http://localhost:3000. Registry routes are served by the same app, so `http://localhost:3000/r/useIdle.json` is a real payload - the install experience is testable without deploying.

### Commands

| Command                        | Does                                             |
| ------------------------------ | ------------------------------------------------ |
| `pnpm dev`                     | Dev server                                       |
| `pnpm build`                   | Production build                                 |
| `pnpm lint`                    | oxlint                                           |
| `pnpm typecheck`               | `fumadocs-mdx` + `next typegen` + `tsc --noEmit` |
| `pnpm format`                  | Write formatting (oxfmt)                         |
| `pnpm format:check`            | Verify formatting                                |
| `pnpm test`                    | Tests, all three browsers                        |
| `pnpm test --project=chromium` | One browser                                      |
| `pnpm test:coverage`           | Coverage (chromium)                              |
| `pnpm test:ui`                 | Headed browser mode                              |

## Testing

Tests run in real Chromium, Firefox and WebKit through Vitest browser mode and Playwright.

One-time browser download:

```bash
pnpm exec playwright install chromium
```

## Contributing

Adding a hook means adding six things. The registry check fails if one is missing:

1. `hooks/useThing.ts` - implementation with a JSDoc block
2. `tests/useThing.test.ts` - suite that fails when the hook breaks
3. `demos/useThing.tsx` - live demo
4. `content/docs/use-thing.mdx` - documentation page
5. `registry.json` entry - name, description, categories, dependencies, files
6. `pnpm exec fumadocs-mdx` regenerates the page index

Before opening a PR:

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test --project=chromium
```

### Conventions

- **One hook per file**, default export plus named export, options object last.
- **Options are optional**, with defaults destructured in the signature.
- **Return shape is stable** - an object, never a positional tuple, except where attaching a ref (`[ref, state]`).
- **DOM targets go through `EventListenerTarget`**, so callers can pass an element, a ref, or nothing.
- **No `"use client"` in `hooks/`** - the directive belongs to the consuming component, not the hook file.

## License

MIT - see [LICENSE](./LICENSE). Once installed, the code is yours; this license covers the source you receive.
