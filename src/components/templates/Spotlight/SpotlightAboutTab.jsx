import React, { memo } from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { TextGradientScroll } from "./text-gradient-scroll";

function SpotlightAboutTab({
  isEditing,
  about,
  skills,
  tools,
  onEditAbout,
  onEditTools,
}) {
  return (
    <div className="p-4 md:p-6 pb-12 relative group/section">
      {isEditing && (
        <div className="absolute -top-3 right-4 md:right-6 transition-opacity z-10 opacity-100 md:opacity-0 md:group-hover/section:opacity-100">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
            onClick={onEditAbout}
          >
            <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
          </Button>
        </div>
      )}
      <div className="max-w-2xl">
        <TextGradientScroll
          text={about?.description || ""}
          className="font-jetbrains text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px] leading-relaxed mb-8"
          textOpacity="medium"
        />

        <div className="space-y-6">
          {skills.length > 0 && (
            <div className="relative group/skill">
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
                    className="h-7 w-7 p-0 rounded-full bg-white dark:bg-[#2A2520] border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                    onClick={onEditTools}
                  >
                    <Pencil className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
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

export default memo(SpotlightAboutTab);
