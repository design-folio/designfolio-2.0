/* eslint-disable @next/next/no-img-element */
import { modals } from "@/lib/constant";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/buttonNew";
import { Plus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Tools({ userDetails, openModal, edit }) {
  const tools = userDetails?.tools || [];

  return (
    <motion.div
      key="toolbox"
      layout
      id="section-toolbox"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.01 }}
      transition={{
        duration: 0.7,
        ease: [0.21, 0.47, 0.32, 0.98],
        delay: 0.1
      }}
      className="bg-df-section-card-bg-color shadow-df-section-card-shadow rounded-[24px] p-6 overflow-visible border-0 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-foreground/50 uppercase tracking-wider" data-testid="text-toolbox-title">
          Toolbox
        </h2>
        {edit && (
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-11 w-11"
            data-testid="button-add-tool"
            onClick={() => openModal?.(modals.tools)}
          >
            <Plus className="w-5 h-5" />
          </Button>
        )}
      </div>

      <div className="relative mt-2 overflow-x-hidden overflow-y-visible -mx-6 px-6">
        {/* Left fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-24 md:w-20 z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, var(--df-section-card-bg-color) 0%, var(--df-section-card-bg-color) 30%, transparent 100%)'
          }}
        />
        {/* Right fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-24 md:w-20 z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to left, var(--df-section-card-bg-color) 0%, var(--df-section-card-bg-color) 30%, transparent 100%)'
          }}
        />

        <div className="flex group">
          <div className="flex animate-scroll group-hover:[animation-play-state:paused] py-4">
            {[...tools, ...tools].map((tool, idx) => (
              <TooltipProvider key={`${tool?.label || tool?.name || idx}-${idx}`}>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div
                      className="bg-tools-card-item-bg-color border border-tools-card-item-border-color rounded-2xl p-3 md:p-4 hover-elevate mx-2 shrink-0 flex items-center justify-center w-16 h-16 md:w-20 md:h-20 cursor-default"
                      data-testid={`card-tool-${tool?.label || tool?.name || idx}-${idx}`}
                    >
                      <img
                        src={tool?.image || tool?.logo || "/assets/svgs/default-tools.svg"}
                        alt={tool?.label || tool?.name || "Tool"}
                        className="w-8 h-8 md:w-10 md:h-10 object-contain"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    sideOffset={5}
                    className="bg-foreground text-background border-none px-3 py-1.5 text-xs font-semibold rounded-full shadow-lg z-[100]"
                  >
                    <p>{tool?.label || tool?.name || "Tool"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
