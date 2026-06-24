import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
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
        className="w-full border-y border-[--lp-border] pt-10 pb-10 overflow-hidden bg-[--lp-card]"
        style={{ fontFamily: "var(--font-manrope), sans-serif" }}
      >
        <div className="px-6 mb-6 text-center">
          <h2 className="text-[22px] font-bold text-[--lp-text] tracking-tight">
            See what people are building
          </h2>
          <p className="mt-1.5 text-[14px] text-lp-text/50 font-medium">
            Over 1000+ portfolios are published every week.
          </p>
        </div>

        {/* Mobile: snap carousel */}
        <div className="sm:hidden">
          <div
            ref={mobileTrackRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth px-[10%]"
            style={{ scrollbarWidth: "none" }}
          >
            {portfolioProjects.map((card, i) => (
              <div
                key={i}
                onClick={() => setSelectedProject(card)}
                className="group snap-center flex-shrink-0 w-[80%] rounded-2xl overflow-hidden bg-[--lp-bg] border border-[--lp-border] cursor-pointer"
              >
                <div className="w-full h-[200px] overflow-hidden bg-[--lp-surface] relative">
                  <img
                    src={card.imageSrc}
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex flex-col gap-3">
                  <p className="text-[15px] font-semibold text-[--lp-text] leading-snug line-clamp-2">
                    {card.title}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProject(card);
                    }}
                    className="self-start flex items-center gap-1.5 text-[12px] font-semibold text-[--lp-text] border border-[--lp-border] rounded-full px-3 py-1.5 hover:bg-[--lp-text] hover:text-[--lp-fg-white] transition-colors duration-200"
                  >
                    View Project <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 mt-5 px-6">
            <motion.button
              onClick={() => navigateMobile(-1)}
              disabled={mobileIndex === 0}
              aria-label="Previous"
              whileTap={{ y: 1 }}
              transition={{ type: "spring", stiffness: 600, damping: 30 }}
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lp-text/40 hover:text-lp-text/70 disabled:opacity-30 transition-colors"
              style={chevronStyle}
            >
              <ChevronLeft className="size-3.5" />
            </motion.button>

            <div className="flex gap-1.5">
              {portfolioProjects.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors duration-200",
                    i === mobileIndex ? "bg-[--lp-text]" : "bg-lp-text/20"
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
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lp-text/40 hover:text-lp-text/70 disabled:opacity-30 transition-colors"
              style={chevronStyle}
            >
              <ChevronRight className="size-3.5" />
            </motion.button>
          </div>
        </div>

        {/* Desktop: infinite auto-scroll */}
        <div
          className="hidden sm:block relative overflow-hidden"
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
                className="group relative flex-shrink-0 w-[360px] rounded-2xl overflow-hidden bg-[--lp-bg] border border-[--lp-border] cursor-pointer"
              >
                <div className="w-full h-[240px] overflow-hidden bg-[--lp-surface] relative">
                  <img
                    src={card.imageSrc}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-5 flex flex-col gap-3.5">
                  <p className="text-[17px] font-semibold text-[--lp-text] leading-snug line-clamp-2">
                    {card.title}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProject(card);
                    }}
                    className="self-start flex items-center gap-1.5 text-[13px] font-semibold text-[--lp-text] border border-[--lp-border] rounded-full px-3.5 py-1.5 hover:bg-[--lp-text] hover:text-[--lp-fg-white] transition-colors duration-200"
                  >
                    View Project <ArrowUpRight className="w-3.5 h-3.5" />
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
          className="max-w-[85vw] w-[85vw] h-[85vh] p-0 overflow-hidden rounded-[20px]"
          style={{ background: "var(--lp-bg)" }}
        >
          <DialogTitle className="sr-only">{selectedProject?.title}</DialogTitle>
          <DialogDescription className="sr-only">{selectedProject?.title}</DialogDescription>
          <div className="relative w-full h-full rounded-[20px] overflow-hidden">
            {selectedProject && (
              <iframe
                src={selectedProject.projectUrl}
                className="w-full h-full"
                title="Project Preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
