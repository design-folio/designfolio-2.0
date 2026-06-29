import React from "react";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { ChevronDown, Briefcase, Sparkles, LayoutTemplate } from "lucide-react";
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
    icon: LayoutTemplate,
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
  {
    id: "jobs",
    label: "Jobs",
    icon: Briefcase,
    color: "#1A1A1A",
    navigation: "/jobs",
  },
];

const IconWrapper = ({ icon: Icon }) => (
  <div className="relative mr-2.5 flex h-4 w-4 shrink-0 items-center justify-center">
    <Icon className="h-4 w-4" />
  </div>
);

export function FluidDropdown() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [hoveredCategory, setHoveredCategory] = React.useState(null);
  const dropdownRef = React.useRef(null);
  const router = useRouter();

  const selectedCategory = React.useMemo(() => {
    const asPath = router.asPath;
    // Longer paths first so `/builder?view=ai-tools&...` matches AI tools, not bare `/builder`.
    const bySpecificity = [...categories].sort((a, b) => b.navigation.length - a.navigation.length);
    return bySpecificity.find((c) => asPath.startsWith(c.navigation)) ?? categories[0];
  }, [router.asPath]);

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
          className="bg-secondary hover:bg-secondary-hover border-border text-foreground flex items-center gap-1 rounded-full border px-3 text-sm font-medium transition-all duration-200 hover:cursor-pointer"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <span className="flex items-center">{selectedCategory.label}</span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="ml-1 flex h-4 w-4 shrink-0 items-center justify-center"
          >
            <ChevronDown className="h-4 w-4" />
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
              className="absolute top-full -left-1.5 z-50 mt-2 min-w-[200px]"
              onKeyDown={handleKeyDown}
              style={{ transformOrigin: "top left" }}
            >
              <div className="border-border bg-card w-full overflow-hidden rounded-2xl border p-1.5 shadow-lg">
                <div className="relative flex flex-col">
                  <motion.div
                    className="bg-secondary-hover absolute top-0 right-0 left-0 z-0 rounded-xl"
                    initial={false}
                    animate={{
                      y:
                        categories.findIndex(
                          (c) => (hoveredCategory || selectedCategory.id) === c.id
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
                    const isActive = (hoveredCategory || selectedCategory.id) === category.id;
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
                          "relative z-10 flex h-[44px] w-full items-center justify-start rounded-xl px-3 text-left text-[13px] font-medium",
                          "transition-colors duration-150",
                          "cursor-pointer focus:outline-none",
                          isActive ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        <div className="flex w-full items-center justify-start">
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
