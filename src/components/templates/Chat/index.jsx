import useChatReveal from "./useChatReveal";
import ChatHeader from "./ChatHeader";
import ChatToolsSection from "./ChatToolsSection";
import ChatProjectsSection from "./ChatProjectsSection";
import ChatExperienceSection from "./ChatExperienceSection";
import ChatTestimonialsSection from "./ChatTestimonialsSection";
import ChatAboutSection from "./ChatAboutSection";
import ChatContactSection from "./ChatContactSection";
import { useGlobalContext } from "@/context/globalContext";

export default function Chat({ isEditing = false, preview = false }) {
  const canEdit = isEditing && !preview;
  const { containerMaxWidth } = useGlobalContext();
  const { chatRevealStep, containerRef, s, sectionSteps, getNextLeftStep } = useChatReveal({
    preview,
  });

  const sharedProps = {
    chatRevealStep,
    s,
    sectionSteps,
    getNextLeftStep,
    canEdit,
    preview,
  };

  return (
    <div
      ref={containerRef}
      className={`flex w-full flex-col gap-3 pb-20 ${preview ? "pt-20" : "pt-0"} font-inter mx-auto px-4 text-[#1A1A1A] selection:bg-[#1A8CFF] selection:text-white md:px-0 dark:text-[#F0EDE7]`}
      style={{ maxWidth: containerMaxWidth ?? 700 }}
    >
      {/* Frosted header card — always on (83% opacity + blur reads as solid when there's
          nothing behind to blur, so it looks the same with or without a wallpaper). */}
      <div className="-mx-4 rounded-2xl bg-[#F0EDE7]/83 px-4 pt-2 pb-4 backdrop-blur-md md:mx-0 dark:bg-[#1A1A1A]/75">
        <ChatHeader chatRevealStep={chatRevealStep} s={s} canEdit={canEdit} />
      </div>
      <ChatToolsSection {...sharedProps} />
      <ChatProjectsSection {...sharedProps} isEditing={isEditing} />
      <ChatExperienceSection {...sharedProps} />
      <ChatTestimonialsSection {...sharedProps} />
      <ChatAboutSection {...sharedProps} />
      <ChatContactSection {...sharedProps} />
    </div>
  );
}
