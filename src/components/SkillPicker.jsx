import React, { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import { Check, Search, Loader2 } from "lucide-react";
import ErrorBanner from "./ErrorBanner";

export default function SkillsPicker({
  skills,
  selected,
  onToggle,
  onAdd,
  search,
  setSearch,
  loading,
  message,
}) {
  const filtered = useMemo(
    () => skills.filter((s) => s.toLowerCase().includes(search.toLowerCase())),
    [skills, search]
  );
  const hasExact = useMemo(
    () => skills.some((s) => s.toLowerCase() === search.toLowerCase()),
    [skills, search]
  );
  const showAdd = search.trim() !== "" && !hasExact;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="mb-4 md:mb-6"
      >
        <div className="relative">
          <div className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2">
            <Search className="text-muted-foreground/60 h-4 w-4" />
          </div>
          <Input
            type="text"
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="input-skills-search"
          />
          {loading && (
            <div className="absolute top-1/2 right-4 -translate-y-1/2">
              <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
            </div>
          )}
        </div>
      </motion.div>

      <div className="-mr-2 mb-4 max-h-[calc(100vh-420px)] overflow-y-auto pr-2 md:mb-8 md:max-h-[calc(100vh-450px)]">
        <ErrorBanner message={message} />
        <motion.div
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0, filter: "blur(4px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          {loading && filtered.length === 0 ? (
            <div className="border-border bg-muted/10 relative flex items-center gap-2 overflow-hidden rounded-full border-2 px-5 py-2.5">
              <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
              <span className="text-muted-foreground text-sm">Loading</span>
              <div className="shimmer-animation absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            </div>
          ) : (
            <>
              {filtered.map((interest) => {
                const isSelected = selected.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() => onToggle(interest)}
                    className="hover-elevate relative flex cursor-pointer items-center gap-2 rounded-full border-2 px-5 py-2.5 text-sm font-medium transition-all"
                    style={
                      isSelected
                        ? {
                            backgroundColor: "var(--onboarding-selected-bg)",
                            borderColor: "#FF553E",
                            color: "#FF553E",
                          }
                        : {
                            backgroundColor: "transparent",
                            borderColor: "hsl(var(--border))",
                            color: "hsl(var(--foreground))",
                          }
                    }
                    data-testid={`button-interest-${interest.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                          <Check className="h-4 w-4" style={{ color: "#FF553E" }} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {interest}
                  </button>
                );
              })}
              {showAdd && (
                <motion.button
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => onAdd(search)}
                  className="hover-elevate relative flex items-center gap-2 rounded-full border-2 border-dashed px-5 py-2.5 text-sm font-medium transition-all"
                  style={{
                    backgroundColor: "transparent",
                    borderColor: "#FF553E",
                    color: "#FF553E",
                  }}
                  data-testid="button-add-custom-skill"
                >
                  Add &quot;{search}&quot; as new skill
                </motion.button>
              )}
            </>
          )}
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .shimmer-animation {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </>
  );
}
