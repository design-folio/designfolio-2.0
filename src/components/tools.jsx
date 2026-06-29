import { sidebars } from "@/lib/constant";
import { useGlobalContext } from "@/context/globalContext";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Section from "./section";

export default function Tools({ userDetails, edit }) {
  const { openSidebar } = useGlobalContext();
  const tools = userDetails?.tools || [];
  const shouldScroll = tools.length > 8;

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
        delay: 0.1,
      }}
    >
      <Section
        title="Toolbox"
        edit={edit}
        sectionId="tools"
        actions={
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-full"
            data-testid="button-add-tool"
            onClick={() => openSidebar(sidebars.tools)}
          >
            <Plus className="h-5 w-5" />
          </Button>
        }
      >
        <div className="relative -mx-2 mt-2 overflow-x-hidden overflow-y-visible px-4 lg:-mx-6 lg:px-6">
          {shouldScroll && (
            <>
              {/* Left fade */}
              <div
                className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-24 md:w-20"
                style={{
                  background:
                    "linear-gradient(to right, var(--df-section-card-bg-color) 0%, var(--df-section-card-bg-color) 30%, transparent 100%)",
                }}
              />
              {/* Right fade */}
              <div
                className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-24 md:w-20"
                style={{
                  background:
                    "linear-gradient(to left, var(--df-section-card-bg-color) 0%, var(--df-section-card-bg-color) 30%, transparent 100%)",
                }}
              />
            </>
          )}

          <div className="group flex">
            <div
              className={
                shouldScroll
                  ? "animate-scroll flex py-4 group-hover:[animation-play-state:paused]"
                  : "flex flex-wrap gap-3 py-4"
              }
            >
              {(shouldScroll ? [...tools, ...tools] : tools).map((tool, idx) => (
                <TooltipProvider key={`${tool?.label || tool?.name || idx}-${idx}`}>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <div
                        className={
                          shouldScroll
                            ? "bg-tools-card-item-bg-color border-tools-card-item-border-color hover-elevate mx-2 flex h-16 w-16 shrink-0 cursor-default items-center justify-center rounded-2xl border p-3 md:h-20 md:w-20 md:p-4"
                            : "bg-tools-card-item-bg-color border-tools-card-item-border-color hover-elevate flex h-16 w-16 shrink-0 cursor-default items-center justify-center rounded-2xl border p-3 md:h-20 md:w-20 md:p-4"
                        }
                        data-testid={`card-tool-${tool?.label || tool?.name || idx}-${idx}`}
                      >
                        <img
                          src={tool?.image || tool?.logo || "/assets/svgs/default-tools.svg"}
                          alt={tool?.label || tool?.name || "Tool"}
                          className="h-8 w-8 object-contain md:h-10 md:w-10"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      sideOffset={5}
                      className="bg-foreground text-background z-[100] rounded-full border-none px-3 py-1.5 text-xs font-semibold shadow-lg"
                    >
                      <p>{tool?.label || tool?.name || "Tool"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </motion.div>
  );
}
