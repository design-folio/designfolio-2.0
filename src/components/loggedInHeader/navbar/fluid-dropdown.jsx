import React from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { ChevronDown, Briefcase, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";

function useClickAway(ref, handler) {
  React.useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

const categories = [
  {
    id: "portfolio",
    label: "Portfolio builder",
    icon: Briefcase,
    color: "#1A1A1A",
    navigation: "/builder",
  },
  {
    id: "other",
    label: "Other AI tools",
    icon: Sparkles,
    color: "#A06CD5",
    navigation: "/builder?view=ai-tools&type=optimize-resume",
  },
];

const IconWrapper = ({ icon: Icon }) => (
  <div className="w-4 h-4 mr-2.5 relative flex items-center justify-center shrink-0">
    <Icon className="w-4 h-4" />
  </div>
);

export function FluidDropdown() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [hoveredCategory, setHoveredCategory] = React.useState(null);
  const dropdownRef = React.useRef(null);
  const router = useRouter();

  const selectedCategory = React.useMemo(
    () =>
      categories.find((c) => router.asPath.startsWith(c.navigation)) ??
      categories[0],
    [router.asPath],
  );

  useClickAway(dropdownRef, () => setIsOpen(false));

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative" ref={dropdownRef}>
        <Button
          variant="secondary"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-secondary hover:bg-secondary-hover border border-border text-foreground font-medium px-3 text-sm rounded-full flex items-center gap-1 hover:cursor-pointer transition-all duration-200"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <span className="flex items-center">{selectedCategory.label}</span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center w-4 h-4 shrink-0 ml-1"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="fluid-dropdown"
              initial={{ opacity: 0, y: -4 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { duration: 0.15, ease: "easeOut" },
              }}
              exit={{
                opacity: 0,
                y: -4,
                pointerEvents: "none",
                transition: { duration: 0.15, ease: "easeIn" },
              }}
              className="absolute -left-1.5 top-full mt-2 z-50 min-w-[200px]"
              onKeyDown={handleKeyDown}
              style={{ transformOrigin: "top left" }}
            >
              <div className="w-full rounded-2xl border border-border bg-card p-1.5 shadow-lg overflow-hidden">
                <div className="relative flex flex-col">
                  <motion.div
                    className="absolute top-0 left-0 right-0 bg-secondary-hover rounded-xl z-0"
                    initial={false}
                    animate={{
                      y:
                        categories.findIndex(
                          (c) =>
                            (hoveredCategory || selectedCategory.id) === c.id,
                        ) * 44,
                      height: 44,
                    }}
                    transition={{
                      type: "spring",
                      bounce: 0.2,
                      duration: 0.4,
                    }}
                  />
                  {categories.map((category) => {
                    const isActive =
                      (hoveredCategory || selectedCategory.id) === category.id;
                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          router.push(category.navigation, undefined, {
                            shallow: true,
                          });
                          setIsOpen(false);
                        }}
                        onMouseEnter={() => setHoveredCategory(category.id)}
                        onMouseLeave={() => setHoveredCategory(null)}
                        className={cn(
                          "relative z-10 flex w-full items-center justify-start px-3 h-[44px] text-[13px] font-medium rounded-xl text-left",
                          "transition-colors duration-150",
                          "focus:outline-none cursor-pointer",
                          isActive
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        <div className="flex items-center justify-start w-full">
                          <IconWrapper icon={category.icon} />
                          {category.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
