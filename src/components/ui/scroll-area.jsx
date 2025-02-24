import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "@/lib/utils";

const ScrollArea = function ScrollArea({ className, children, ...props }) {
  return /*#__PURE__*/ React.createElement(
    ScrollAreaPrimitive.Root,
    {
      ref: ref,
      className: cn("relative overflow-hidden", className),
      ...props,
    },
    /*#__PURE__*/ React.createElement(
      ScrollAreaPrimitive.Viewport,
      {
        className: "h-full w-full rounded-[inherit]",
      },
      children
    ),
    /*#__PURE__*/ React.createElement(ScrollBar, null),
    /*#__PURE__*/ React.createElement(ScrollAreaPrimitive.Corner, null)
  );
};

ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}) {
  return /*#__PURE__*/ React.createElement(
    ScrollAreaPrimitive.ScrollAreaScrollbar,
    {
      ref: ref,
      orientation: orientation,
      className: cn(
        "flex touch-none select-none transition-colors",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent p-[1px]",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent p-[1px]",
        className
      ),
      ...props,
    },
    /*#__PURE__*/ React.createElement(ScrollAreaPrimitive.ScrollAreaThumb, {
      className: "relative flex-1 rounded-full bg-border",
    })
  );
};

ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
