import React, { memo } from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { TextGradientScroll } from "./text-gradient-scroll";
import { SectionVisibilityButton } from "@/components/section";
import { DEFAULT_PEGBOARD_IMAGES } from "@/lib/aboutConstants";

function ProfessionalAboutTab({
  isEditing,
  about,
  skills,
  tools,
  onEditAbout,
  onEditSkills,
  onEditTools,
}) {
  const aboutImages =
    about?.pegboardImages?.length > 0
      ? about.pegboardImages
      : DEFAULT_PEGBOARD_IMAGES;

  return (
    <div className="px-4 md:px-6 pb-12 group/section">
      {isEditing && (
        <div className="-mx-4 md:-mx-6 px-1 py-2 flex items-center justify-end gap-2 border-b border-[#D5D0C6] dark:border-[#3A352E] mb-6">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 rounded-none border-[#D5D0C6] dark:border-[#3A352E] bg-[#EFECE6] dark:bg-[#1A1A1A] hover:bg-[#E5E0D8] dark:hover:bg-[#2A2520] text-[#1A1A1A] dark:text-[#F0EDE7] opacity-100 md:opacity-0 md:group-hover/section:opacity-100 transition-opacity"
            onClick={onEditAbout}
            title="Edit story"
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <SectionVisibilityButton
            sectionId="about"
            showOnHoverWhenVisible
            className="h-8 w-8 rounded-none border-[#D5D0C6] dark:border-[#3A352E] bg-[#EFECE6] dark:bg-[#1A1A1A] hover:bg-[#E5E0D8] dark:hover:bg-[#2A2520]"
          />
        </div>
      )}
      <div className="max-w-2xl">
        <div className="mb-8">
          <div
            className="relative h-[220px] md:h-[260px] border border-[#D5D0C6] dark:border-[#3A352E] bg-[#F5F1EA] dark:bg-[#201B16] overflow-hidden"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(122,115,108,0.2) 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          >
            {[0, 1, 2].map((idx) => {
              const img = aboutImages[idx];
              const src = img?.src || img?.key || img;
              if (!src) return null;

              const positionClasses = [
                "left-[8%] top-[16%] rotate-[-5deg] w-28 h-36 md:w-32 md:h-40",
                "left-[36%] top-[10%] rotate-[4deg] w-32 h-32 md:w-40 md:h-40",
                "right-[8%] top-[18%] rotate-[-2deg] w-28 h-36 md:w-32 md:h-40",
              ];

              return (
                <div
                  key={`about-image-${idx}`}
                  className={`absolute ${positionClasses[idx]} border border-[#D5D0C6] dark:border-[#3A352E] bg-white dark:bg-[#2A2520] p-1.5 shadow-sm`}
                >
                  <img
                    src={src}
                    alt={`About ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-center text-[10px] font-medium tracking-widest uppercase text-[#7A736C]/70 dark:text-[#B5AFA5]/60 pointer-events-none">
            Try moving things around :)
          </p>
        </div>

        {about?.description ? (
          <TextGradientScroll
            text={about.description}
            className="font-jetbrains text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px] leading-relaxed mb-8"
            textOpacity="medium"
          />
        ) : isEditing ? (
          <button
            onClick={onEditAbout}
            className="mb-8 text-left font-jetbrains text-[13px] text-[#7A736C] dark:text-[#B5AFA5] hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
          >
            Click here to add your story...
          </button>
        ) : (
          <p className="mb-8 font-jetbrains text-[13px] text-[#7A736C] dark:text-[#B5AFA5]">
            Click here to add your story...
          </p>
        )}

        <div className="space-y-6">
          {skills.length > 0 && (
            <div className="relative group/skill">
              {isEditing && (
                <div className="absolute top-0 right-0 z-10 opacity-100 md:opacity-0 md:group-hover/skill:opacity-100 transition-opacity">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 rounded-none border-[#D5D0C6] dark:border-[#3A352E] bg-[#EFECE6] dark:bg-[#1A1A1A] hover:bg-[#E5E0D8] dark:hover:bg-[#2A2520] text-[#1A1A1A] dark:text-[#F0EDE7]"
                    onClick={onEditSkills}
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                </div>
              )}
              <h4 className="font-jetbrains text-[#1A1A1A] dark:text-[#F0EDE7] text-[18px] uppercase tracking-wider mb-3 font-semibold">
                Capabilities
              </h4>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 border border-[#D5D0C6] dark:border-[#3A352E] font-jetbrains text-[14px] text-[#7A736C] dark:text-[#B5AFA5] rounded-full"
                  >
                    {typeof skill === "string"
                      ? skill
                      : skill.label || skill.name || ""}
                  </span>
                ))}
              </div>
            </div>
          )}

          {tools.length > 0 && (
            <div className="relative group/tech">
              {isEditing && (
                <div className="absolute top-0 right-0 z-10 opacity-100 md:opacity-0 md:group-hover/tech:opacity-100 transition-opacity">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 rounded-none border-[#D5D0C6] dark:border-[#3A352E] bg-[#EFECE6] dark:bg-[#1A1A1A] hover:bg-[#E5E0D8] dark:hover:bg-[#2A2520] text-[#1A1A1A] dark:text-[#F0EDE7]"
                    onClick={onEditTools}
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                </div>
              )}
              <h4 className="font-jetbrains text-[#1A1A1A] dark:text-[#F0EDE7] text-[18px] uppercase tracking-wider mb-3 font-semibold">
                Stack
              </h4>
              <div className="flex flex-wrap gap-2">
                {tools.map((tool, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 border border-[#D5D0C6] dark:border-[#3A352E] bg-[#EFECE6] dark:bg-[#1A1A1A] font-jetbrains text-[14px] text-[#1A1A1A] dark:text-[#F0EDE7] rounded-full"
                  >
                    {tool.label || tool.name || tool}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(ProfessionalAboutTab);
