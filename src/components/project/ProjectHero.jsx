import { useState } from "react";
import { useRouter } from "next/router";
import { AnimatePresence } from "motion/react";
import ImmersiveHero from "./ImmersiveHero";
import EditorialHero from "./EditorialHero";

export default function ProjectHero({
  project,
  onChange,
  onMetaChange,
  mode,
  onImageUpload,
  onBack,
  onAnalyze,
  onWorkClick,
  resumeUrl,
  analyzeStatus,
  analyzeButtonLabel,
  analyzeTooltipMessage,
  isAnalyzeDisabled,
  isAnalyzing,
}) {
  const router = useRouter();
  const heroView = project?.heroView ?? "editorial";

  // Lifted so switching immersive↔editorial doesn't replay the title blur-in.
  const [titleAnimDone, setTitleAnimDone] = useState(false);

  const setHeroView = (v) => onChange?.({ heroView: v });

  const navRowProps = {
    mode,
    heroView,
    setHeroView,
    // router.back() keeps the SPA navigation (and the viewer's theme choice) intact.
    onBack: onBack || (() => router.back()),
    onWorkClick: onWorkClick || (() => {}),
    resumeUrl,
    onAnalyze,
    project,
    analyzeStatus,
    analyzeButtonLabel,
    analyzeTooltipMessage,
    isAnalyzeDisabled,
    isAnalyzing,
  };

  const heroProps = {
    project,
    onChange,
    onMetaChange,
    mode,
    onImageUpload,
    titleAnimDone,
    setTitleAnimDone,
    navRowProps,
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {heroView === "immersive" ? (
        <ImmersiveHero key="immersive" {...heroProps} />
      ) : (
        <EditorialHero key="editorial" {...heroProps} />
      )}
    </AnimatePresence>
  );
}
