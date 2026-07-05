import { motion, LayoutGroup } from "motion/react";
import { cn } from "@/lib/utils";

function ImmersiveGlyph({ active, dark }) {
  const fill = dark ? "white" : "currentColor";
  const op = active ? (dark ? 1 : 0.85) : dark ? 0.5 : 0.4;
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="12" height="12" rx="1.5" fill={fill} fillOpacity={op} />
    </svg>
  );
}

function EditorialGlyph({ active, dark }) {
  const fill = dark ? "white" : "currentColor";
  const op = active ? (dark ? 1 : 0.85) : dark ? 0.5 : 0.4;
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="12" height="5" rx="1" fill={fill} fillOpacity={op} />
      <rect x="1" y="8" width="7" height="1.5" rx="0.75" fill={fill} fillOpacity="0.4" />
      <rect x="1" y="11" width="5" height="1.5" rx="0.75" fill={fill} fillOpacity="0.4" />
    </svg>
  );
}

const OPTIONS = [
  { key: "immersive", title: "Immersive view", Glyph: ImmersiveGlyph },
  { key: "editorial", title: "Editorial view", Glyph: EditorialGlyph },
];

export default function ViewToggle({ heroView, setHeroView, dark }) {
  // Scope the layout animation per instance so the immersive (dark) and
  // editorial toggles never share a sliding pill during the hero transition.
  const pillId = `hero-view-pill-${dark ? "dark" : "light"}`;

  return (
    <LayoutGroup id={pillId}>
      <div
        className={cn(
          "flex items-center gap-0.5 rounded-lg p-1",
          dark ? "bg-white/10 backdrop-blur-sm" : "bg-black/5 dark:bg-white/5"
        )}
      >
        {OPTIONS.map(({ key, title, Glyph }) => {
          const isActive = heroView === key;
          return (
            <button
              key={key}
              onClick={() => setHeroView(key)}
              title={title}
              className="relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-colors"
            >
              {isActive && (
                <motion.span
                  layoutId="active-pill"
                  className={cn(
                    "absolute inset-0 rounded-md",
                    dark ? "bg-white/20" : "bg-white shadow-sm dark:bg-[#2A2520]"
                  )}
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center">
                <Glyph active={isActive} dark={dark} />
              </span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
