import React from "react";
import { useGlobalContext } from "@/context/globalContext";
import CanvasHeader from "./CanvasHeader";
import CanvasProfileCard from "./CanvasProfileCard";
import CanvasSkillsMarquee from "./CanvasSkillsMarquee";
import CanvasProjectsSection from "./CanvasProjectsSection";
import CanvasCareerLadder from "./CanvasCareerLadder";
import CanvasToolsMarquee from "./CanvasToolsMarquee";
import CanvasAboutSection from "./CanvasAboutSection";
import CanvasTestimonialsSection from "./CanvasTestimonialsSection";
import CanvasContactSection from "./CanvasContactSection";
import { DEFAULT_SECTION_ORDER, normalizeSectionOrder } from "@/lib/constant";

export default function Canvas({ isEditing, preview = false, publicView = false }) {
  const { userDetails } = useGlobalContext();
  const { skills = [] } = userDetails || {};

  const sectionOrder = normalizeSectionOrder(userDetails?.sectionOrder, DEFAULT_SECTION_ORDER);
  const hiddenSections = userDetails?.hiddenSections || [];
  const isSectionVisible = (id) => isEditing || !hiddenSections.includes(id);

  const sectionComponents = {
    projects: isSectionVisible('projects') && (
      <CanvasProjectsSection key="projects" isEditing={isEditing} preview={preview} publicView={publicView} />
    ),
    works: isSectionVisible('works') && (
      <CanvasCareerLadder key="works" isEditing={isEditing} />
    ),
    tools: isSectionVisible('tools') && (
      <CanvasToolsMarquee key="tools" isEditing={isEditing} />
    ),
    about: isSectionVisible('about') && (
      <CanvasAboutSection key="about" isEditing={isEditing} />
    ),
    reviews: isSectionVisible('reviews') && (
      <CanvasTestimonialsSection key="reviews" isEditing={isEditing} />
    ),
  };

  return (
    <div className="w-full flex-1 flex flex-col gap-3 pb-20 pt-0 px-4 md:px-0 max-w-[720px] mx-auto">
      <CanvasHeader persistTheme={isEditing && !preview} />
      <CanvasProfileCard isEditing={isEditing} />
      <CanvasSkillsMarquee skills={skills} isEditing={isEditing} />
      {sectionOrder.map((id) => sectionComponents[id] || null)}
      <CanvasContactSection isEditing={isEditing} />
    </div>
  );
}
