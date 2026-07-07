import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/router";

// Routes that participate in the portfolio ↔ project crossfade. Kept deliberately
// narrow: the builder, project editor, settings, jobs, etc. must NOT fade — they
// are heavy/stateful and an app-wide page fade would fight their scroll + layout.
const FADE_ROUTES = new Set([
  "/builder", // in-app project editor
  "/portfolio-preview", // in-app portfolio preview
  "/preview/[id]", // public portfolio
  "/project/[id]", // public project
  "/project/[id]/editor", // in-app project editor
  "/project/[id]/preview", // in-app project preview
]);

const EASE = [0.23, 1, 0.32, 1];

export function ProjectPageFade({ children }) {
  const router = useRouter();
  const isFadeRoute = FADE_ROUTES.has(router.pathname);
  const key = isFadeRoute ? router.asPath : "app-shell";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        // `display: contents` on non-fade routes so this wrapper contributes
        // nothing to layout (preserves the builder's full-height flex cascades).
        style={isFadeRoute ? undefined : { display: "contents" }}
        initial={isFadeRoute ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        exit={isFadeRoute ? { opacity: 0 } : undefined}
        transition={{ duration: 0.28, ease: EASE }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
