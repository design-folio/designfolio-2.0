import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Dock({ items, className }) {
  const [hovered, setHovered] = React.useState(null);

  return (
    <div className={cn("flex w-full items-center justify-center", className)}>
      <motion.div
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className={cn(
          "flex items-end gap-2 rounded-3xl px-3 py-2",
          "border-border border bg-white/90 shadow-sm shadow-black/5 backdrop-blur-2xl",
          "dark:border-white/10 dark:bg-black/40"
        )}
      >
        <TooltipProvider delayDuration={100}>
          {items.map((item, i) => {
            const isActive = !!item.active;
            const isHovered = hovered === i;

            return (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <motion.div
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    animate={{
                      scale: isHovered ? 1.2 : 1,
                      rotate: isHovered ? -5 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="relative flex flex-col items-center"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "no-default-hover-elevate no-default-active-elevate relative h-12 w-12 rounded-2xl",
                        "transition-colors duration-200",
                        isActive ? "bg-[#FF553E]/10" : "hover:bg-[#FF553E]/5",
                        isHovered && "bg-[#FF553E]/5 shadow-lg shadow-[#FF553E]/10"
                      )}
                      onClick={() => item.onClick?.()}
                      type="button"
                    >
                      <item.icon
                        className={cn(
                          "h-6 w-6 transition-colors",
                          isActive ? "text-df-orange-color" : "text-df-ink-color"
                        )}
                      />
                      {isHovered && (
                        <motion.span
                          layoutId="glow"
                          className="absolute inset-0 rounded-2xl border border-[#FF553E]/30"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="bg-foreground text-background border-none px-2 py-1 text-[10px] font-bold tracking-wider uppercase"
                >
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </motion.div>
    </div>
  );
}
