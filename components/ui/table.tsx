"use client";

import * as React from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useSize, type SizeStep } from "@/context/size-context";
import { cn } from "cn";

const TableContext = React.createContext<{ size: SizeStep }>({ size: "default" });

export interface TableProps extends React.ComponentPropsWithoutRef<"table"> {
  size?: SizeStep;
  containerClassName?: string;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ size: sizeProp, containerClassName, className, ...props }, forwardedRef) => {
    const { size } = useSize(sizeProp);

    return (
      <TableContext.Provider value={{ size }}>
        <div
          data-slot="table-container"
          data-size={size}
          className={cn(
            "not-prose relative w-full overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-control",
            containerClassName
          )}
        >
          <ScrollArea
            orientation="horizontal"
            viewportClassName="scroll-fade-x w-full"
          >
            <table
              ref={forwardedRef}
              data-slot="table"
              className={cn(
                "w-full caption-bottom border-collapse text-left",
                size === "compact" ? "text-xs" : "text-ui",
                className
              )}
              {...props}
            />
          </ScrollArea>
        </div>
      </TableContext.Provider>
    );
  }
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.ComponentPropsWithoutRef<"thead">
>(({ className, ...props }, forwardedRef) => (
  <thead
    ref={forwardedRef}
    data-slot="table-header"
    className={cn(
      "border-b border-border-subtle bg-muted/40 [&_tr]:border-b-0",
      className
    )}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.ComponentPropsWithoutRef<"tbody">
>(({ className, ...props }, forwardedRef) => (
  <tbody
    ref={forwardedRef}
    data-slot="table-body"
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.ComponentPropsWithoutRef<"tfoot">
>(({ className, ...props }, forwardedRef) => (
  <tfoot
    ref={forwardedRef}
    data-slot="table-footer"
    className={cn(
      "border-t border-border-subtle bg-muted/30 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.ComponentPropsWithoutRef<"tr">
>(({ className, ...props }, forwardedRef) => (
  <tr
    ref={forwardedRef}
    data-slot="table-row"
    className={cn(
      "border-b border-border-subtle transition-colors duration-150 ease-out",
      "pointer-hover:hover:bg-fluid-hover",
      "data-[state=selected]:bg-fluid-selected",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ComponentPropsWithoutRef<"th">
>(({ className, ...props }, forwardedRef) => {
  const { size } = React.useContext(TableContext);

  return (
    <th
      ref={forwardedRef}
      data-slot="table-head"
      className={cn(
        "align-middle font-medium whitespace-nowrap text-muted-foreground select-none",
        size === "compact" ? "h-8 px-3 text-2xs" : "h-9 px-4 text-xs",
        className
      )}
      {...props}
    />
  );
});
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.ComponentPropsWithoutRef<"td">
>(({ className, ...props }, forwardedRef) => {
  const { size } = React.useContext(TableContext);

  return (
    <td
      ref={forwardedRef}
      data-slot="table-cell"
      className={cn(
        "align-top",
        size === "compact" ? "px-3 py-2.5" : "px-4 py-3",
        className
      )}
      {...props}
    />
  );
});
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.ComponentPropsWithoutRef<"caption">
>(({ className, ...props }, forwardedRef) => (
  <caption
    ref={forwardedRef}
    data-slot="table-caption"
    className={cn("mt-3 text-xs text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
