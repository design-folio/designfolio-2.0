import { useState } from "react";
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
  const heroView = project?.heroView ?? "editorial";

  // Lifted so switching immersive↔editorial doesn't replay the title blur-in.
  const [titleAnimDone, setTitleAnimDone] = useState(false);

  const setHeroView = (v) => onChange?.({ heroView: v });

  const navRowProps = {
    mode,
    heroView,
    setHeroView,
    onBack: onBack || (() => typeof window !== "undefined" && window.history.back()),
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
