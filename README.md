# ohook

> A modern, open-code collection of 88 zero-dependency React hooks distributed via the shadcn registry.

<p align="center">
  <a href="https://ohooks.vercel.app/">
    <img width="128" height="128" alt="ohook logo" src="./app/icon1.png">
  </a>
</p>

- [👉 Check out the docs](https://ohooks.vercel.app/)
- [📦 Registry catalog (`/r/registry.json`)](https://ohooks.vercel.app/r/registry.json)
- [🤖 LLM index (`/llms.txt`)](https://ohooks.vercel.app/llms.txt)

## Quick start

### 1. Add the `@ohook` namespace

Configure the registry in your project with a single CLI command:

```bash
npx shadcn@latest registry add @ohook=https://ohooks.vercel.app/r/{name}.json
```

Or add it to your `components.json` manually:

```json
{
  "registries": {
    "@ohook": "https://ohooks.vercel.app/r/{name}.json"
  }
}
```

### 2. Install hooks

```bash
# Install a single hook (automatically resolves internal hook dependencies)
npx shadcn@latest add @ohook/use-local-storage

# Install multiple hooks at once
npx shadcn@latest add @ohook/use-debounce-value @ohook/use-media-query @ohook/use-hotkeys

# Install all 88 hooks in one command
npx shadcn@latest add @ohook/all
```

> [!TIP]
> Don't want to configure a namespace? You can install any hook directly via its URL:
> `npx shadcn@latest add https://ohooks.vercel.app/r/use-local-storage.json`

## Features

### Registry & CLI experience

- **Automatic dependency graph resolution** - installing `useDarkMode` automatically pulls in `useLocalStorage`, `useMediaQuery`, and `useHydrated`
- **Multi-package-manager support** - copy-ready CLI commands for `pnpm`, `npm`, `yarn`, `bun`, `deno`, `ni`, `vlt`, `vp`, `nub`, and `upm`
- **Dual naming convention** - every registry endpoint supports both `kebab-case` (`use-local-storage.json`) and `camelCase` (`useLocalStorage.json`)
- **CLI discovery & search** - list and search all 88 hooks from your terminal via `npx shadcn@latest search @ohook`
- **Pre-install inspection** - preview exact file contents and dependencies before installing with `npx shadcn@latest view @ohook/<hook>`
- **HTTP content negotiation** - requests from the `shadcn` CLI or AI agents automatically receive JSON registry payloads or clean Markdown

### Documentation & DX

- **Interactive live previews** - every hook page features an interactive demo alongside its full source code
- **Auto-generated TypeTables** - TypeScript AST-powered parameter and return type tables generated via `fumadocs-typescript`
- **Step-by-step manual installation** - collapsible dependency and source code steps for projects not using the CLI
- **Dark mode and light mode** - custom OKLCH surface, border, and elevation token system
- **Instant full-text search** - search across all hooks, descriptions, and APIs
- **Dynamic OpenGraph images** - auto-generated OG cards for every documentation route

## Hooks catalog (88 hooks)

### State & data structures

- `useBoolean` - boolean state with `setTrue`, `setFalse`, and `toggle` helpers
- `useControllableState` - seamless controlled/uncontrolled state management
- `useCounter` - numeric counter with `min`/`max` clamping and step actions
- `useHistoryState` - undo/redo state timeline with configurable capacity
- `useList` - reactive array state with immutable mutation helpers
- `useMap` - reactive `Map` wrapper with granular actions
- `usePagination` - headless pagination math with sibling/boundary ellipses
- `usePrevious` - tracks the value from the previous render pass
- `usePreviousDistinct` - tracks the previous distinct value using a custom comparator
- `useQueue` - FIFO queue state with `enqueue`, `dequeue`, and `peek`
- `useSelection` - single/multiple item selection with range and `toggleAll` support
- `useSet` - reactive `Set` state with `add`, `remove`, and `toggle`
- `useToggle` - boolean toggle hook that safely ignores DOM click events

### Storage & browser state

- `useBroadcastChannel` - typed cross-tab messaging via the BroadcastChannel API
- `useCookie` - reactive `document.cookie` reader/writer synced via CookieStore & custom events
- `useCopyToClipboard` - clipboard writer with automatic `isCopied` reset timer
- `useDarkMode` - system-aware dark mode manager (`light` / `dark` / `system`)
- `useDocumentTitle` - declarative `document.title` updater with unmount restoration
- `useHash` - reactive `window.location.hash` state synced with history navigation
- `useLocalStorage` - cross-tab and intra-tab synchronized `localStorage` state
- `useObjectUrl` - automatic `URL.createObjectURL` creation and revocation for `Blob`/`MediaSource`
- `useSessionStorage` - synchronized `sessionStorage` state with custom serializer support
- `useUrlSearchParams` - reactive `URLSearchParams` state with `push`/`replace` history modes

### DOM, layout & observers

- `useElementRef` - stateful callback ref that re-renders when a DOM node mounts or unmounts
- `useElementScroll` - element scroll coordinates, direction, boundary detection, and `scrollTo`
- `useElementSize` - reactive `width` and `height` tracking via `ResizeObserver`
- `useFullscreen` - cross-browser Fullscreen API wrapper
- `useInert` - reference-counted `inert` and `aria-hidden` management for modals and drawers
- `useInfiniteScroll` - `IntersectionObserver`-driven infinite scroll loader
- `useIntersectionObserver` - reactive intersection entry tracking with `freezeOnceVisible`
- `useLockBodyScroll` - reference-counted scroll locking with scrollbar gap reservation
- `useMeasure` - callback ref + `ResizeObserver` bounding box measurement (`content-box` / `border-box`)
- `useMergeRefs` - merges multiple React object and callback refs with React 19 cleanup support
- `useMutationObserver` - declarative `MutationObserver` wrapper for DOM tree changes
- `useResizeObserver` - low-level `ResizeObserver` subscription hook
- `useScript` - reference-counted external `<script>` loader with status tracking
- `useScrollSpy` - tracks which section is currently active in the viewport
- `useTextareaAutosize` - automatic height adjustment for `<textarea>` elements
- `useVirtualList` - headless fixed/variable-height list virtualization with binary search
- `useVisualViewport` - tracks mobile pinch-zoom and virtual keyboard viewport metrics
- `useWindowScroll` - window scroll position with optional throttling and `scrollTo`
- `useWindowSize` - reactive `window.innerWidth` and `window.innerHeight` state

### Interactions, gestures & accessibility

- `useDropZone` - drag-and-drop file target with MIME type and extension validation
- `useEventListener` - type-safe event listener for `Window`, `Document`, `HTMLElement`, and `MediaQueryList`
- `useFileDialog` - programmatic file/directory picker without rendering an `<input>`
- `useFocus` - tracks focus and `:focus-visible` state with imperative `focus`/`blur`
- `useFocusTrap` - traps `Tab`/`Shift+Tab` keyboard focus inside modals and dialogs
- `useHotkeys` - keyboard shortcut listener with `mod`, key aliases, and form-field filtering
- `useHover` - hover state tracking with configurable enter and leave delays
- `useIdle` - detects user inactivity across pointer, keyboard, and visibility events
- `useKeyPress` - tracks whether a key filter or hotkey combination is currently held down
- `useLongPress` - pointer long-press gesture with movement threshold and click suppression
- `useMouse` - RAF-throttled page, client, screen, and element-relative cursor coordinates
- `useOnClickOutside` - detects pointer events outside one or multiple target elements (Shadow DOM aware)
- `usePointerDrag` - pointer-capture drag state with axis locking and distance thresholds
- `useRovingTabIndex` - WAI-ARIA roving `tabIndex` keyboard navigation for toolbars and lists
- `useSwipe` - pointer swipe direction and distance detection
- `useTextSelection` - reactive `window.getSelection()` text, `Range` list, and bounding `DOMRect`

### Timers, scheduling & async

- `useAnimationFrame` - controllable `requestAnimationFrame` loop with `deltaTime` and `fpsLimit`
- `useAsyncTask` - abortable async function runner with `status`, `run`, `abort`, and `reset`
- `useCountdown` - controllable countdown/countup timer with `start`, `pause`, and `reset`
- `useDebounceCallback` - debounced function with `leading`, `trailing`, `maxWait`, `flush`, and `cancel`
- `useDebounceValue` - debounced reactive value paired with its controller
- `useInterval` - declarative `setInterval` with dynamic delay and pause support
- `useRafCallback` - schedules a callback onto the next animation frame with `cancel` and `flush`
- `useSpinDelay` - prevents loading spinner flashes for fast responses (`delay` + `minDuration`)
- `useThrottleCallback` - throttled function with `leading`/`trailing` edge control
- `useThrottleValue` - throttled reactive value
- `useTimeout` - declarative `setTimeout` hook

### Device, network & lifecycle

- `useBeforeUnload` - prompts the user before leaving the page when unsaved changes exist
- `useDevicePixelRatio` - reactive `window.devicePixelRatio` tracking across display changes
- `useDocumentVisibility` - reactive `document.visibilityState` via `useSyncExternalStore`
- `useEventCallback` - stable function identity that always reads the latest props and state
- `useFirstMountState` - returns `true` only on the initial component mount
- `useGeolocation` - reactive `navigator.geolocation` watcher
- `useHydrated` - SSR-safe boolean indicating whether the client has hydrated
- `useIsomorphicLayoutEffect` - `useLayoutEffect` on the client, `useEffect` on the server
- `useLatest` - ref box that always holds the latest value without triggering re-renders
- `useMediaQuery` - SSR-safe `window.matchMedia` subscription via `useSyncExternalStore`
- `useNetworkInformation` - tracks connection speed (`effectiveType`, `rtt`, `downlink`, `saveData`)
- `useOnline` - reactive `navigator.onLine` status
- `usePermission` - queries and subscribes to the Web Permissions API
- `usePreferredLanguage` - reactive `navigator.language` tracking on `languagechange`
- `useScreenOrientation` - tracks screen orientation type/angle with `lock` and `unlock` controls
- `useUnmount` - invokes a cleanup callback exclusively when the component unmounts
- `useUnmountedRef` - ref indicating whether the component has unmounted
- `useUpdateEffect` - `useEffect` that skips the initial mount and runs only on updates
- `useWakeLock` - Screen Wake Lock API wrapper with automatic re-acquisition on tab visibility

## URL structure

### Registry & LLM endpoints

ohook serves human-readable docs, machine-readable Markdown, and `shadcn` JSON payloads from a unified URL structure:

| Pattern            | Description                                                             |
| ------------------ | ----------------------------------------------------------------------- |
| `/r/registry.json` | Full `shadcn` registry catalog (`npx shadcn list` / `search`)           |
| `/r/<hook>.json`   | Individual `registry:hook` payload (`camelCase` or `kebab-case`)        |
| `/r/all.json`      | Complete bundle containing all 88 hooks and DOM utilities               |
| `/llms.txt`        | Concise Markdown index of all documentation pages for LLMs              |
| `/llms-full.txt`   | Complete documentation corpus concatenated into a single Markdown file  |
| `/<path>.md`       | Raw Markdown version of any documentation page                          |

## Local development

```bash
# Install dependencies
pnpm install

# Generate registry.json and public/r/*.json
pnpm tsx scripts/generate-registry.ts

# Start the development server
pnpm dev
```
