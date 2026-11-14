"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "cn";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface PackageManagerCommand {
  id: string;
  label: string;
  group: "standard" | "modern";
  command: string;
  prefix?: string;
  target?: string;
}

export type PackageManagerItem = PackageManagerCommand;

const STORAGE_KEY = "preferred-package-manager";

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getStorageSnapshot(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getServerSnapshot(): string | null {
  return null;
}

export function HookInstallationCli({
  commands,
  items,
  defaultManager = "pnpm",
}: {
  commands?: PackageManagerCommand[];
  items?: PackageManagerCommand[];
  defaultManager?: string;
}) {
  const list = React.useMemo(
    () => items ?? commands ?? [],
    [items, commands]
  );

  const savedManager = React.useSyncExternalStore(
    subscribeToStorage,
    getStorageSnapshot,
    getServerSnapshot
  );

  const [fallbackSelected, setFallbackSelected] = React.useState<string | null>(
    null
  );
  const [copied, setCopied] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const selected = React.useMemo(() => {
    if (savedManager && list.some((item) => item.id === savedManager)) {
      return savedManager;
    }
    if (fallbackSelected && list.some((item) => item.id === fallbackSelected)) {
      return fallbackSelected;
    }
    return defaultManager;
  }, [savedManager, fallbackSelected, list, defaultManager]);

  const handleSelect = React.useCallback((value: unknown) => {
    if (typeof value === "string") {
      try {
        window.localStorage.setItem(STORAGE_KEY, value);
        window.dispatchEvent(
          new StorageEvent("storage", { key: STORAGE_KEY, newValue: value })
        );
      } catch {
        setFallbackSelected(value);
      }
    }
  }, []);

  const activeItem =
    list.find((item) => item.id === selected) ?? list[0];

  const activeCommand = activeItem?.command ?? "";
  const lastSpaceIdx = activeCommand.lastIndexOf(" ");
  const prefix =
    activeItem?.prefix ??
    (lastSpaceIdx !== -1
      ? activeCommand.slice(0, lastSpaceIdx)
      : activeCommand);
  const target =
    activeItem?.target ??
    (lastSpaceIdx !== -1 ? activeCommand.slice(lastSpaceIdx + 1) : "");

  const handleCopy = React.useCallback(async () => {
    if (!activeCommand) return;
    try {
      await navigator.clipboard.writeText(activeCommand);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
    }
  }, [activeCommand]);

  const standardItems = React.useMemo(
    () => list.filter((item) => item.group === "standard"),
    [list]
  );
  const modernItems = React.useMemo(
    () => list.filter((item) => item.group === "modern"),
    [list]
  );

  return (
    <div
      data-slot="hook-installation-cli"
      className="not-prose flex h-11 w-full items-center overflow-hidden rounded-xl border border-border-subtle bg-code text-foreground shadow-control"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5 pl-2.5 pr-1">
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Copied" : "Copy command"}
          title={copied ? "Copied" : "Copy command"}
          className={cn(
            "relative grid size-7 shrink-0 place-items-center rounded-md border border-border-subtle bg-control/80 text-muted-foreground leading-none shadow-2xs outline-none select-none",
            "transition-[transform,background-color,border-color,color,opacity,box-shadow] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
            "pointer-hover:hover:border-border-hover pointer-hover:hover:bg-control pointer-hover:hover:text-foreground",
            "active:scale-[0.95] motion-reduce:transition-none",
            "focus-visible:border-border-focus focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          <Copy
            aria-hidden="true"
            strokeWidth={1.75}
            className={cn(
              "col-start-1 row-start-1 size-3.5 transition-[opacity,transform,filter] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
              copied
                ? "scale-[0.85] opacity-0 blur-[2px]"
                : "scale-100 opacity-100 blur-0"
            )}
          />

          <Check
            aria-hidden="true"
            strokeWidth={2.25}
            className={cn(
              "col-start-1 row-start-1 size-3.5 text-success transition-[opacity,transform,filter] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
              copied
                ? "scale-100 opacity-100 blur-0"
                : "scale-[0.85] opacity-0 blur-[2px]"
            )}
          />
        </button>

        <div className="flex min-w-0 flex-1 items-center font-mono text-xs">
          <span
            aria-hidden="true"
            className="mr-2 shrink-0 text-muted-foreground/55 select-none"
          >
            $
          </span>

          <div className="flex min-w-0 flex-1 items-center overflow-x-auto pr-3 whitespace-nowrap scrollbar-none [mask-image:linear-gradient(to_right,black_calc(100%-16px),transparent)] [&::-webkit-scrollbar]:hidden">
            <span className="text-muted-foreground select-all">
              {prefix}
              {target ? (
                <>
                  {" "}
                  <span className="font-medium text-foreground">{target}</span>
                </>
              ) : null}
            </span>
          </div>
        </div>
      </div>

      <div className="flex h-full shrink-0 items-center border-l border-border-subtle bg-code-header/45 px-2">
        <Select value={selected} onValueChange={handleSelect}>
          <SelectTrigger
            size="compact"
            variant="bordered"
            aria-label="Select package manager"
            className="h-7 w-auto min-w-18 gap-1.5 rounded-md border-border-subtle bg-control/80 px-2.5 font-mono text-xs text-foreground/90 shadow-2xs pointer-hover:hover:bg-control"
          >
            <SelectValue>{activeItem?.label ?? selected}</SelectValue>
          </SelectTrigger>

          <SelectContent align="end" sideOffset={6} className="min-w-35">
            {standardItems.length > 0 && (
              <SelectGroup>
                <SelectGroupLabel>Package Managers</SelectGroupLabel>
                {standardItems.map((item) => (
                  <SelectItem
                    key={item.id}
                    value={item.id}
                    className="font-mono text-xs"
                  >
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}

            {standardItems.length > 0 && modernItems.length > 0 && (
              <SelectSeparator />
            )}

            {modernItems.length > 0 && (
              <SelectGroup>
                <SelectGroupLabel>Runtimes & Universal</SelectGroupLabel>
                {modernItems.map((item) => (
                  <SelectItem
                    key={item.id}
                    value={item.id}
                    className="font-mono text-xs"
                  >
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
