import React, { memo, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Pencil, X } from "lucide-react";
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

  const storyImageUrls = useMemo(
    () =>
      aboutImages
        .map((img) => img?.src || img?.key || "")
        .filter(Boolean)
        .slice(0, 4),
    [aboutImages],
  );

  const [selectedStoryImage, setSelectedStoryImage] = useState(null);

  return (
    <div className="px-4 md:px-6 pb-20 group/section">
      {isEditing && (
        <div className="-mx-4 md:-mx-6 px-1 py-2 flex items-center justify-end gap-2 border-b border-[#D5D0C6] dark:border-[#3A352E] mb-6">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 rounded-full border-[#D5D0C6] dark:border-[#3A352E] bg-[#EFECE6] dark:bg-[#1A1A1A] hover:bg-[#E5E0D8] dark:hover:bg-[#2A2520] text-[#1A1A1A] dark:text-[#F0EDE7] opacity-100 md:opacity-0 md:group-hover/section:opacity-100 transition-opacity"
            onClick={onEditAbout}
            title="Edit story"
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <SectionVisibilityButton
            sectionId="about"
            showOnHoverWhenVisible
            className="h-8 w-8 rounded-full border-[#D5D0C6] dark:border-[#3A352E] bg-[#EFECE6] dark:bg-[#1A1A1A] hover:bg-[#E5E0D8] dark:hover:bg-[#2A2520]"
          />
        </div>
      )}
      <div className="max-w-2xl">
        <div className="relative mb-8 flex h-56 items-center justify-center">
          {storyImageUrls[0] ? (
            <motion.div
              initial={{ rotate: -8, x: -120, y: 0 }}
              whileHover={{ rotate: -2, scale: 1.1, zIndex: 50 }}
              onClick={() => setSelectedStoryImage(storyImageUrls[0])}
              className="absolute z-0 h-40 w-32 cursor-pointer overflow-hidden rounded-xl border-4 border-white shadow-lg dark:border-[#2A2520]"
            >
              <img
                src={storyImageUrls[0]}
                alt="My workspace"
                className="h-full w-full object-cover"
              />
            </motion.div>
          ) : null}
          {storyImageUrls[1] ? (
            <motion.div
              initial={{ rotate: 12, x: -40, y: 15 }}
              whileHover={{ rotate: 5, scale: 1.1, zIndex: 50 }}
              onClick={() => setSelectedStoryImage(storyImageUrls[1])}
              className="absolute z-10 h-36 w-36 cursor-pointer overflow-hidden rounded-xl border-4 border-white shadow-lg dark:border-[#2A2520]"
            >
              <img
                src={storyImageUrls[1]}
                alt="Designing"
                className="h-full w-full object-cover"
              />
            </motion.div>
          ) : null}
          {storyImageUrls[2] ? (
            <motion.div
              initial={{ rotate: -5, x: 40, y: -10 }}
              whileHover={{ rotate: 0, scale: 1.1, zIndex: 50 }}
              onClick={() => setSelectedStoryImage(storyImageUrls[2])}
              className="absolute z-20 h-40 w-32 cursor-pointer overflow-hidden rounded-xl border-4 border-white shadow-lg dark:border-[#2A2520]"
            >
              <img
                src={storyImageUrls[2]}
                alt="Coffee and notes"
                className="h-full w-full object-cover"
              />
            </motion.div>
          ) : null}
          {storyImageUrls[3] ? (
            <motion.div
              initial={{ rotate: 8, x: 120, y: 20 }}
              whileHover={{ rotate: 3, scale: 1.1, zIndex: 50 }}
              onClick={() => setSelectedStoryImage(storyImageUrls[3])}
              className="absolute z-30 h-36 w-36 cursor-pointer overflow-hidden rounded-xl border-4 border-white shadow-lg dark:border-[#2A2520]"
            >
              <img
                src={storyImageUrls[3]}
                alt="Creative studio"
                className="h-full w-full object-cover"
              />
            </motion.div>
          ) : null}
        </div>
        <p className="mb-8 -mt-2 text-center text-[10px] font-medium uppercase tracking-widest text-[#7A736C]/70 dark:text-[#B5AFA5]/60 pointer-events-none">
          Try moving things around :)
        </p>

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

        <div className="flex flex-col gap-6">
          {skills.length > 0 && (
            <div className="relative group/skill">
              {isEditing && (
                <div className="absolute top-0 right-0 z-10 opacity-100 md:opacity-0 md:group-hover/skill:opacity-100 transition-opacity">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 rounded-full border-[#D5D0C6] dark:border-[#3A352E] bg-[#EFECE6] dark:bg-[#1A1A1A] hover:bg-[#E5E0D8] dark:hover:bg-[#2A2520] text-[#1A1A1A] dark:text-[#F0EDE7]"
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
                    className="h-7 w-7 p-0 rounded-full border-[#D5D0C6] dark:border-[#3A352E] bg-[#EFECE6] dark:bg-[#1A1A1A] hover:bg-[#E5E0D8] dark:hover:bg-[#2A2520] text-[#1A1A1A] dark:text-[#F0EDE7]"
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

      <AnimatePresence>
        {selectedStoryImage ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedStoryImage(null)}
            className="fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center bg-black/60 p-4 backdrop-blur-sm sm:p-8"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Close full image"
                onClick={() => setSelectedStoryImage(null)}
                className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <X className="size-5" />
              </button>
              <img
                src={selectedStoryImage}
                alt="Story full view"
                className="h-auto max-h-[90vh] w-auto max-w-full object-contain"
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default memo(ProfessionalAboutTab);
