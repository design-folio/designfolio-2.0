import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "../../ui/button";
import { useGlobalContext } from "@/context/globalContext";
import { sidebars } from "@/lib/constant";
import { CanvasSectionControls, CanvasSectionButton } from "./CanvasSectionControls";
import { SectionVisibilityButton } from "@/components/section";
import { getPlainTextLength } from "@/lib/tiptapUtils";
import SimpleTiptapRenderer from "@/components/SimpleTiptapRenderer";
import { cn } from "@/lib/utils";

function ExperienceCard({
  experience,
  isEditing,
  expandedCards,
  onToggleExpand,
}) {
  const { setSelectedWork, openSidebar, activeSidebar, selectedWork } = useGlobalContext();

  const {
    role,
    company,
    startMonth,
    startYear,
    endMonth,
    endYear,
    currentlyWorking,
    description,
    _id,
  } = experience;

  const textLength = getPlainTextLength(description || "");
  const hasDescription = description && textLength > 0;
  // ~150 chars ≈ 3 lines at typical card width — only clamp & show button beyond that
  const needsExpand = textLength > 150;
  const isExpanded = expandedCards.includes(_id);
  // Retain bg when this card's sidebar is actively open
  const isActive = isEditing && activeSidebar === sidebars.work && selectedWork?._id === _id;

  return (
    <div
      key={_id}
      className={cn(
        "relative group cursor-pointer p-4 -mx-4 rounded-2xl transition-colors",
        "hover:bg-black/5 dark:hover:bg-white/5",
        isActive && "bg-black/5 dark:bg-white/5"
      )}
    >
      {isEditing && (
        <div className="absolute top-4 right-4 z-20 transition-opacity flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
            onClick={() => {
              setSelectedWork(experience);
              openSidebar(sidebars.work);
            }}
          >
            <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400"
            onClick={(e) => e.stopPropagation()}
          >
            <Trash2 className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
          </Button>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2 sm:gap-0">
        <h3 className="text-[18px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
          {role} @ {company}
        </h3>
        <div className="bg-[#F0EDE7] dark:bg-[#3A352E] px-3 py-1 rounded-full text-[13px] text-[#1A1A1A] dark:text-[#F0EDE7] w-fit whitespace-nowrap">
          {`${startMonth} ${startYear}  — ${currentlyWorking ? "Present" : `${endMonth} ${endYear}`}`}
        </div>
      </div>
      {hasDescription && (
        needsExpand ? (
          <>
            <motion.div
              initial={false}
              animate={{ height: isExpanded ? "auto" : "4.875em" }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden"
            >
              <SimpleTiptapRenderer
                content={description || ""}
                mode="work"
                enableBulletList={true}
                className="text-[#7A736C] dark:text-[#B5AFA5] text-[15px] leading-relaxed"
                noCardStyle
              />
            </motion.div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(_id);
              }}
              className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] mt-3 flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity"
            >
              {isExpanded ? "View less" : "View more"}
              <motion.svg
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </motion.svg>
            </button>
          </>
        ) : (
          <SimpleTiptapRenderer
            content={description || ""}
            mode="work"
            enableBulletList={true}
            className="text-[#7A736C] dark:text-[#B5AFA5] text-[15px] leading-relaxed"
            noCardStyle
          />
        )
      )}
    </div>
  );
}

const MemoizedExperienceCard = React.memo(ExperienceCard);

function CanvasCareerLadder({ isEditing }) {
  const { userDetails, openSidebar } = useGlobalContext();
  const { experiences = [] } = userDetails || {};

  const careerLadderRef = useRef(null);
  const ladderContainerRef = useRef(null);
  const [characterPosition, setCharacterPosition] = useState(0);
  const [expandedCards, setExpandedCards] = useState([]);

  const toggleExpand = useCallback((id) => {
    setExpandedCards((prev) =>
      prev.includes(id)
        ? prev.filter((cardId) => cardId !== id)
        : [...prev, id],
    );
  }, []);

  useEffect(() => {
    let rafId;

    const updatePosition = () => {
      if (!careerLadderRef.current || !ladderContainerRef.current) return;

      const sectionRect = careerLadderRef.current.getBoundingClientRect();
      const containerHeight = ladderContainerRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;

      const sectionTop = sectionRect.top;
      const sectionHeight = sectionRect.height;

      let progress = 0;
      const middleOfScreen = viewportHeight / 2;
      const distanceFromMiddle = sectionTop - middleOfScreen;

      if (distanceFromMiddle > 0) {
        progress = 0;
      } else if (distanceFromMiddle < -sectionHeight) {
        progress = 1;
      } else {
        progress = Math.abs(distanceFromMiddle) / sectionHeight;
      }
      progress = Math.max(0, Math.min(1, progress));

      const maxPosition = containerHeight - 54;
      setCharacterPosition(progress * maxPosition);
    };

    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updatePosition);
    };

    updatePosition();
    const timeoutId = setTimeout(updatePosition, 50);

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.6 }}
      ref={careerLadderRef}
      className="bg-white dark:bg-[#2A2520] rounded-[24px] border border-[#E5D7C4] dark:border-white/10 p-4 md:p-6 w-full mt-2 relative group/section"
    >
      {isEditing && (
        <CanvasSectionControls>
          {experiences.length > 0 && (
            <CanvasSectionButton
              icon={<Plus className="w-3.5 h-3.5" />}
              label="Add Experience"
              onClick={() => openSidebar(sidebars.work)}
            />
          )}
          <SectionVisibilityButton
            sectionId="works"
            className="w-8 h-8 rounded-full bg-white dark:bg-[#2A2520] shadow-md border border-[#E5D7C4] dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#35302A]"
          />
        </CanvasSectionControls>
      )}
      <h2
        className="text-[#7A736C] dark:text-[#B5AFA5] font-dm-mono font-medium text-[14px] mb-6"
      >
        CAREER LADDER
      </h2>

      {experiences.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-black/10 dark:border-white/10 bg-white/50 dark:bg-[#2A2520]/50 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-full bg-black/[0.03] dark:bg-white/[0.03] flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-[#7A736C] dark:text-[#9E9893]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 13.255A23.193 23.193 0 0112 15c-3.183 0-6.22-.64-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-[15px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] mb-1">
            No experience yet
          </h3>
          <p className="text-[13px] text-[#7A736C] dark:text-[#9E9893] max-w-[250px] mb-5">
            Add your work experience to showcase your career journey.
          </p>
          {isEditing && (
            <Button
              onClick={() => openSidebar(sidebars.work)}
              className="h-9 px-5 rounded-full text-[13px] font-medium bg-[#1A1A1A] dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90 transition-colors shadow-sm flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Experience
            </Button>
          )}
        </div>
      ) : (
        <div ref={ladderContainerRef} className="relative flex">
          {experiences.length > 1 && (
            <>
              <div
                className="absolute left-[1px] z-20 w-[40px] h-[54px]"
                style={{
                  top: `${characterPosition}px`,
                  willChange: "transform",
                }}
              >
                <img
                  src="/assets/svgs/character-me.svg"
                  alt="Character climbing"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="absolute left-0 top-3 bottom-0 w-[42px] flex flex-col justify-between items-start border-x-[5px] border-[#F0EDE7] dark:border-[#3A352E] py-1 bg-transparent">
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    className="w-full h-[5px] bg-[#F0EDE7] dark:bg-[#3A352E]"
                  ></div>
                ))}
              </div>
            </>
          )}

          <div
            className={`space-y-12 ${experiences.length !== 1 ? "pl-16" : ""} relative z-10 w-full pt-1 pb-2`}
          >
            {experiences.map((experience) => (
              <MemoizedExperienceCard
                key={experience._id}
                experience={experience}
                isEditing={isEditing}
                expandedCards={expandedCards}
                onToggleExpand={toggleExpand}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default React.memo(CanvasCareerLadder);
