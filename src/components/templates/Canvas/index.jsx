import React from "react";
import { useGlobalContext } from "@/context/globalContext";
import CanvasHeader from "./CanvasHeader";
import CanvasProfileCard from "./CanvasProfileCard";
import CanvasProjectsSection from "./CanvasProjectsSection";
import CanvasCareerLadder from "./CanvasCareerLadder";
import CanvasToolsMarquee from "./CanvasToolsMarquee";
import CanvasAboutSection from "./CanvasAboutSection";
import CanvasTestimonialsSection from "./CanvasTestimonialsSection";
import CanvasContactSection from "./CanvasContactSection";
import { DEFAULT_SECTION_ORDER, normalizeSectionOrder } from "@/lib/constant";
import { usePersistableThemeToggle } from "@/hooks/usePersistableThemeToggle";

export default function Canvas({ isEditing, preview = false, publicView = false }) {
  const { userDetails } = useGlobalContext();
  const { skills = [] } = userDetails || {};

  const sectionOrder = normalizeSectionOrder(userDetails?.sectionOrder, DEFAULT_SECTION_ORDER);
  const hiddenSections = userDetails?.hiddenSections || [];
  const isSectionVisible = (id) => isEditing || !hiddenSections.includes(id);

  const sectionComponents = {
    projects: isSectionVisible("projects") && (
      <CanvasProjectsSection
        key="projects"
        isEditing={isEditing}
        preview={preview}
        publicView={publicView}
      />
    ),
    works: isSectionVisible("works") && (
      <CanvasCareerLadder key="works" isEditing={isEditing} preview={preview} />
    ),
    tools: isSectionVisible("tools") && <CanvasToolsMarquee key="tools" isEditing={isEditing} />,
    about: isSectionVisible("about") && <CanvasAboutSection key="about" isEditing={isEditing} />,
    reviews: isSectionVisible("reviews") && (
      <CanvasTestimonialsSection key="reviews" isEditing={isEditing} preview={preview} />
    ),
  };

  return (
    <div className="mx-auto flex w-full max-w-[848px] flex-1 flex-col gap-3 px-4 pt-0 pb-20 md:px-0">
      {/* <CanvasHeader persistTheme={isEditing && !preview} /> */}
      <CanvasProfileCard
        isEditing={isEditing}
        skills={skills}
        persistTheme={isEditing && !preview}
      />
      {sectionOrder.map((id) => sectionComponents[id] || null)}
      <CanvasContactSection isEditing={isEditing} />
    </div>
  );
}
