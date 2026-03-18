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

export default function Canvas({ isEditing, preview = false, publicView = false }) {
  const { userDetails } = useGlobalContext();
  const { skills = [] } = userDetails || {};

  return (
    <div className="w-full flex-1 flex flex-col gap-3 pb-20 pt-0 px-4 md:px-0 max-w-[640px] mx-auto">
      <CanvasHeader />
      <CanvasProfileCard isEditing={isEditing} />
      <CanvasSkillsMarquee skills={skills} />
      <CanvasProjectsSection isEditing={isEditing} preview={preview} publicView={publicView} />
      <CanvasCareerLadder isEditing={isEditing} />
      <CanvasToolsMarquee isEditing={isEditing} />
      <CanvasAboutSection isEditing={isEditing} />
      <CanvasTestimonialsSection isEditing={isEditing} />
      <CanvasContactSection isEditing={isEditing} />
    </div>
  );
}
