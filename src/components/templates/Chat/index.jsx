import useChatReveal from "./useChatReveal";
import ChatHeader from "./ChatHeader";
import ChatToolsSection from "./ChatToolsSection";
import ChatProjectsSection from "./ChatProjectsSection";
import ChatExperienceSection from "./ChatExperienceSection";
import ChatTestimonialsSection from "./ChatTestimonialsSection";
import ChatAboutSection from "./ChatAboutSection";
import ChatContactSection from "./ChatContactSection";

export default function Chat({ isEditing = false, preview = false }) {
  const canEdit = isEditing && !preview;
  const { chatRevealStep, containerRef, s, sectionSteps, getNextLeftStep } =
    useChatReveal({ preview });

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
      className={`w-full flex flex-col gap-3 pb-20 ${preview ? "pt-20" : "pt-0"} px-4 md:px-0 max-w-[640px] mx-auto font-inter text-[#1A1A1A] dark:text-[#F0EDE7] selection:bg-[#1A8CFF] selection:text-white`}
    >
      <ChatHeader chatRevealStep={chatRevealStep} s={s} canEdit={canEdit} />
      <ChatToolsSection {...sharedProps} />
      <ChatProjectsSection {...sharedProps} isEditing={isEditing} />
      <ChatExperienceSection {...sharedProps} />
      <ChatTestimonialsSection {...sharedProps} />
      <ChatAboutSection {...sharedProps} />
      <ChatContactSection {...sharedProps} />
    </div>
  );
}
