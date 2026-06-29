import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { portfolioProjects } from "./shared/portfolioData";

const doubled = [...portfolioProjects, ...portfolioProjects];

export default function LandingPortfolioGallery() {
  const [isDark, setIsDark] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mobileIndex, setMobileIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const mobileTrackRef = useRef(null);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const chevronStyle = isDark
    ? {
        background: "linear-gradient(to bottom, #2e2c2a, #252320)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.07)",
      }
    : {
        background: "linear-gradient(to bottom, #ffffff, #ece9e3)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.85)",
        border: "1px solid rgba(0,0,0,0.07)",
      };

  const navigateMobile = (dir) => {
    const next = Math.max(0, Math.min(portfolioProjects.length - 1, mobileIndex + dir));
    setMobileIndex(next);
    if (mobileTrackRef.current) {
      const card = mobileTrackRef.current.children[next];
      card?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  };

  return (
    <>
      <section
        className="w-full overflow-hidden border-y border-(--lp-border) bg-(--lp-card) pt-10 pb-10"
        style={{ fontFamily: "var(--font-manrope), sans-serif" }}
      >
        <div className="mb-6 px-6 text-center">
          <h2 className="text-[22px] font-bold tracking-tight text-(--lp-text)">
            See what people are building
          </h2>
          <p className="text-lp-text/50 mt-1.5 text-[14px] font-medium">
            Over 1000+ portfolios are published every week.
          </p>
        </div>

        {/* Mobile: snap carousel */}
        <div className="sm:hidden">
          <div
            ref={mobileTrackRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-[10%]"
            style={{ scrollbarWidth: "none" }}
          >
            {portfolioProjects.map((card, i) => (
              <div
                key={i}
                onClick={() => setSelectedProject(card)}
                className="group w-[80%] shrink-0 cursor-pointer snap-center overflow-hidden rounded-2xl border border-(--lp-border) bg-(--lp-bg)"
              >
                <div className="relative h-[200px] w-full overflow-hidden bg-(--lp-surface)">
                  <img
                    src={card.imageSrc}
                    alt={card.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-3 p-4">
                  <p className="line-clamp-2 text-[15px] leading-snug font-semibold text-(--lp-text)">
                    {card.title}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProject(card);
                    }}
                    className="flex items-center gap-1.5 self-start rounded-full border border-(--lp-border) px-3 py-1.5 text-[12px] font-semibold text-(--lp-text) transition-colors duration-200 hover:bg-(--lp-text) hover:text-(--lp-fg-white)"
                  >
                    View Project <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-center gap-4 px-6">
            <motion.button
              onClick={() => navigateMobile(-1)}
              disabled={mobileIndex === 0}
              aria-label="Previous"
              whileTap={{ y: 1 }}
              transition={{ type: "spring", stiffness: 600, damping: 30 }}
              className="text-lp-text/40 hover:text-lp-text/70 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-30"
              style={chevronStyle}
            >
              <ChevronLeft className="size-3.5" />
            </motion.button>

            <div className="flex gap-1.5">
              {portfolioProjects.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors duration-200",
                    i === mobileIndex ? "bg-(--lp-text)" : "bg-lp-text/20"
                  )}
                />
              ))}
            </div>

            <motion.button
              onClick={() => navigateMobile(1)}
              disabled={mobileIndex === portfolioProjects.length - 1}
              aria-label="Next"
              whileTap={{ y: 1 }}
              transition={{ type: "spring", stiffness: 600, damping: 30 }}
              className="text-lp-text/40 hover:text-lp-text/70 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-30"
              style={chevronStyle}
            >
              <ChevronRight className="size-3.5" />
            </motion.button>
          </div>
        </div>

        {/* Desktop: infinite auto-scroll */}
        <div
          className="relative hidden overflow-hidden sm:block"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div
            className="flex gap-5 pl-6"
            style={{
              animation: "portfolioScroll 55s linear infinite",
              animationPlayState: hovered ? "paused" : "running",
              width: "max-content",
            }}
          >
            {doubled.map((card, i) => (
              <div
                key={i}
                onClick={() => setSelectedProject(card)}
                className="group relative w-[360px] shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-(--lp-border) bg-(--lp-bg)"
              >
                <div className="relative h-[240px] w-full overflow-hidden bg-(--lp-surface)">
                  <img
                    src={card.imageSrc}
                    alt={card.title}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
                <div className="flex flex-col gap-3.5 p-5">
                  <p className="line-clamp-2 text-[17px] leading-snug font-semibold text-(--lp-text)">
                    {card.title}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProject(card);
                    }}
                    className="flex items-center gap-1.5 self-start rounded-full border border-(--lp-border) px-3.5 py-1.5 text-[13px] font-semibold text-(--lp-text) transition-colors duration-200 hover:bg-(--lp-text) hover:text-(--lp-fg-white)"
                  >
                    View Project <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project preview dialog */}
      <Dialog
        open={!!selectedProject}
        onOpenChange={(open) => {
          if (!open) setSelectedProject(null);
        }}
      >
        <DialogContent
          className="h-[85vh] w-[85vw] max-w-[85vw] overflow-hidden rounded-[20px] p-0"
          style={{ background: "var(--lp-bg)" }}
        >
          <DialogTitle className="sr-only">{selectedProject?.title}</DialogTitle>
          <DialogDescription className="sr-only">{selectedProject?.title}</DialogDescription>
          <div className="relative h-full w-full overflow-hidden rounded-[20px]">
            {selectedProject && (
              <iframe
                src={selectedProject.projectUrl}
                className="h-full w-full"
                title="Project Preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
