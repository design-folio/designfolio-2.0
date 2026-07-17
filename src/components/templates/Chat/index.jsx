import useChatReveal from "./useChatReveal";
import ChatHeader from "./ChatHeader";
import ChatToolsSection from "./ChatToolsSection";
import ChatProjectsSection from "./ChatProjectsSection";
import ChatExperienceSection from "./ChatExperienceSection";
import ChatTestimonialsSection from "./ChatTestimonialsSection";
import ChatAboutSection from "./ChatAboutSection";
import ChatContactSection from "./ChatContactSection";
import { useGlobalContext } from "@/context/globalContext";
import { cn } from "@/lib/utils";

export default function Chat({ isEditing = false, preview = false }) {
  const canEdit = isEditing && !preview;
  const { containerMaxWidth, hasWallpaper } = useGlobalContext();
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
      className={cn(
        "font-inter mx-auto flex w-full flex-col px-4 pb-20 text-[#1A1A1A] selection:bg-[#1A8CFF] selection:text-white md:px-0 dark:text-[#F0EDE7]",
        preview ? "pt-0" : "pt-0"
      )}
      style={{ maxWidth: containerMaxWidth ?? 700 }}
    >
      <div
        className={cn(
          "flex w-full flex-col gap-3",
          hasWallpaper &&
            "rounded-2xl border border-black/5 bg-white/85 px-4 py-6 backdrop-blur-sm md:px-6 dark:border-white/5 dark:bg-[#1A1A1A]/85"
        )}
      >
        <ChatHeader chatRevealStep={chatRevealStep} s={s} canEdit={canEdit} />
        <ChatToolsSection {...sharedProps} />
        <ChatProjectsSection {...sharedProps} isEditing={isEditing} />
        <ChatExperienceSection {...sharedProps} />
        <ChatTestimonialsSection {...sharedProps} />
        <ChatAboutSection {...sharedProps} />
        <ChatContactSection {...sharedProps} />
      </div>
    </div>
  );
}
