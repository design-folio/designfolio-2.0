import React, { memo, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
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
    about?.pegboardImages?.length > 0 ? about.pegboardImages : DEFAULT_PEGBOARD_IMAGES;

  const storyImageUrls = useMemo(
    () =>
      aboutImages
        .map((img) => img?.src || img?.key || "")
        .filter(Boolean)
        .slice(0, 4),
    [aboutImages]
  );

  const [selectedStoryImage, setSelectedStoryImage] = useState(null);

  return (
    <div className="group/section px-4 pb-20 md:px-6">
      {isEditing && (
        <div className="-mx-4 mb-6 flex items-center justify-end gap-2 border-b border-[#D5D0C6] px-1 py-2 md:-mx-6 dark:border-[#3A352E]">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 rounded-full border-[#D5D0C6] bg-[#EFECE6] p-0 text-[#1A1A1A] opacity-100 transition-opacity hover:bg-[#E5E0D8] md:opacity-0 md:group-hover/section:opacity-100 dark:border-[#3A352E] dark:bg-[#1A1A1A] dark:text-[#F0EDE7] dark:hover:bg-[#2A2520]"
            onClick={onEditAbout}
            title="Edit story"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <SectionVisibilityButton
            sectionId="about"
            showOnHoverWhenVisible
            className="h-8 w-8 rounded-full border-[#D5D0C6] bg-[#EFECE6] hover:bg-[#E5E0D8] dark:border-[#3A352E] dark:bg-[#1A1A1A] dark:hover:bg-[#2A2520]"
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
              <img src={storyImageUrls[1]} alt="Designing" className="h-full w-full object-cover" />
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
        <p className="text-scaled-10 pointer-events-none -mt-2 mb-8 text-center font-medium tracking-widest text-[#7A736C]/70 uppercase dark:text-[#B5AFA5]/60">
          Try moving things around :)
        </p>

        {about?.description ? (
          <TextGradientScroll
            text={about.description}
            className="font-jetbrains text-scaled-15 mb-8 leading-relaxed text-[#1A1A1A] dark:text-[#F0EDE7]"
            textOpacity="medium"
          />
        ) : isEditing ? (
          <button
            onClick={onEditAbout}
            className="font-jetbrains text-scaled-13 mb-8 text-left text-[#7A736C] transition-colors hover:text-[#1A1A1A] dark:text-[#B5AFA5] dark:hover:text-white"
          >
            Click here to add your story...
          </button>
        ) : null}

        <div className="flex flex-col gap-6">
          {skills.length > 0 && (
            <div className="group/skill relative">
              {isEditing && (
                <div className="absolute top-0 right-0 z-10 opacity-100 transition-opacity md:opacity-0 md:group-hover/skill:opacity-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 rounded-full border-[#D5D0C6] bg-[#EFECE6] p-0 text-[#1A1A1A] hover:bg-[#E5E0D8] dark:border-[#3A352E] dark:bg-[#1A1A1A] dark:text-[#F0EDE7] dark:hover:bg-[#2A2520]"
                    onClick={onEditSkills}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <h4 className="font-jetbrains text-scaled-18 mb-3 font-semibold tracking-wider text-[#1A1A1A] uppercase dark:text-[#F0EDE7]">
                Capabilities
              </h4>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="font-jetbrains text-scaled-14 rounded-full border border-[#D5D0C6] px-3 py-1.5 text-[#7A736C] dark:border-[#3A352E] dark:text-[#B5AFA5]"
                  >
                    {typeof skill === "string" ? skill : skill.label || skill.name || ""}
                  </span>
                ))}
              </div>
            </div>
          )}

          {tools.length > 0 && (
            <div className="group/tech relative">
              {isEditing && (
                <div className="absolute top-0 right-0 z-10 opacity-100 transition-opacity md:opacity-0 md:group-hover/tech:opacity-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 rounded-full border-[#D5D0C6] bg-[#EFECE6] p-0 text-[#1A1A1A] hover:bg-[#E5E0D8] dark:border-[#3A352E] dark:bg-[#1A1A1A] dark:text-[#F0EDE7] dark:hover:bg-[#2A2520]"
                    onClick={onEditTools}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <h4 className="font-jetbrains text-scaled-18 mb-3 font-semibold tracking-wider text-[#1A1A1A] uppercase dark:text-[#F0EDE7]">
                Stack
              </h4>
              <div className="flex flex-wrap gap-2">
                {tools.map((tool, index) => (
                  <span
                    key={index}
                    className="font-jetbrains text-scaled-14 rounded-full border border-[#D5D0C6] bg-[#EFECE6] px-3 py-1.5 text-[#1A1A1A] dark:border-[#3A352E] dark:bg-[#1A1A1A] dark:text-[#F0EDE7]"
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
                className="absolute top-4 right-4 z-10 flex size-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-black/70 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
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
