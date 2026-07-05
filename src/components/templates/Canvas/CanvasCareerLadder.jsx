import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ChevronsUpDown, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "../../ui/button";
import { useGlobalContext } from "@/context/globalContext";
import { sidebars } from "@/lib/constant";
import { CanvasSectionControls, CanvasSectionButton } from "./CanvasSectionControls";
import { SectionVisibilityButton } from "@/components/section";
import { getPlainTextLength } from "@/lib/tiptapUtils";
import SimpleTiptapRenderer from "@/components/SimpleTiptapRenderer";
import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { _deleteExperience } from "@/network/post-request";
import { cn } from "@/lib/utils";

function ExperienceCard({ experience, isEditing, expandedCards, onToggleExpand, onDelete }) {
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
        "group relative -mx-4 cursor-pointer rounded-2xl p-4 transition-colors",
        "hover:bg-black/5 dark:hover:bg-white/5",
        isActive && "bg-black/5 dark:bg-white/5"
      )}
    >
      {isEditing && (
        <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 rounded-full border-[#E5D7C4] bg-white/90 p-0 shadow-sm backdrop-blur-sm hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520]/90 dark:hover:bg-[#35302A]"
            onClick={() => {
              setSelectedWork(experience);
              openSidebar(sidebars.work);
            }}
          >
            <Pencil className="h-3.5 w-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 rounded-full border-[#E5D7C4] bg-white/90 p-0 shadow-sm backdrop-blur-sm hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-white/10 dark:bg-[#2A2520]/90 dark:hover:border-red-900/50 dark:hover:bg-red-950/30 dark:hover:text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(experience);
            }}
          >
            <Trash2 className="h-3.5 w-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
          </Button>
        </div>
      )}
      <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
        <h3 className="text-base font-semibold text-[#1A1A1A] md:max-w-sm dark:text-[#F0EDE7]">
          {role} @ {company}
        </h3>
        <div className="w-fit rounded-full bg-[#F0EDE7] px-3 py-1 text-[13px] whitespace-nowrap text-[#1A1A1A] dark:bg-[#3A352E] dark:text-[#F0EDE7]">
          {`${startMonth} ${startYear}  — ${currentlyWorking ? "Present" : `${endMonth} ${endYear}`}`}
        </div>
      </div>
      {hasDescription &&
        (needsExpand ? (
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
                className="text-[15px] leading-relaxed text-[#7A736C] dark:text-[#B5AFA5]"
                noCardStyle
              />
            </motion.div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(_id);
              }}
              className="mt-3 flex items-center gap-1.5 text-[13px] font-medium text-[#1A1A1A] opacity-70 transition-opacity hover:opacity-100 dark:text-[#F0EDE7]"
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
            className="text-[15px] leading-relaxed text-[#7A736C] dark:text-[#B5AFA5]"
            noCardStyle
          />
        ))}
    </div>
  );
}

const MemoizedExperienceCard = React.memo(ExperienceCard);

function CanvasCareerLadder({ isEditing, preview = false }) {
  const { userDetails, setUserDetails, updateCache, openSidebar, openNewWork } = useGlobalContext();
  const { experiences = [] } = userDetails || {};

  const careerLadderRef = useRef(null);
  const ladderContainerRef = useRef(null);
  const [characterPosition, setCharacterPosition] = useState(0);
  const [expandedCards, setExpandedCards] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const toggleExpand = useCallback((id) => {
    setExpandedCards((prev) =>
      prev.includes(id) ? prev.filter((cardId) => cardId !== id) : [...prev, id]
    );
  }, []);

  const handleDeleteExperience = useCallback((experience) => {
    setDeleteTarget(experience);
  }, []);

  const confirmDelete = useCallback(() => {
    const target = deleteTarget;
    if (!target?._id) return;

    _deleteExperience(target._id).then(() => {
      const removeById = (list) => (list || []).filter((item) => item._id !== target._id);
      setUserDetails((prev) => ({
        ...prev,
        experiences: removeById(prev?.experiences),
      }));
      updateCache("userDetails", (prev) => ({
        ...prev,
        experiences: removeById(prev?.experiences),
      }));
    });
  }, [deleteTarget, setUserDetails, updateCache]);

  useEffect(() => {
    let rafId;

    // In the builder, html.sidebar-layout locks window scroll and the
    // FloatingPageContainer (a fixed, overflow-y-auto div) is the real scroll
    // container. Walk up the DOM to find it so scroll events are captured
    // correctly in both the builder and the public/preview views.
    const getScrollContainer = (el) => {
      let node = el?.parentElement;
      while (node && node !== document.documentElement) {
        if (node === document.body) {
          node = node.parentElement;
          continue;
        }
        const { overflow, overflowY } = window.getComputedStyle(node);
        if (/(auto|scroll)/.test(overflow + overflowY)) return node;
        node = node.parentElement;
      }
      return window;
    };

    const scrollEl = getScrollContainer(careerLadderRef.current);
    const isWindow = scrollEl === window;

    const updatePosition = () => {
      if (!careerLadderRef.current || !ladderContainerRef.current) return;

      const sectionRect = careerLadderRef.current.getBoundingClientRect();
      const containerHeight = ladderContainerRef.current.offsetHeight;
      const viewportHeight = isWindow ? window.innerHeight : scrollEl.clientHeight;
      // sectionRect.top is viewport-relative; make it relative to scroll container
      const containerTop = isWindow ? 0 : scrollEl.getBoundingClientRect().top;
      const relativeSectionTop = sectionRect.top - containerTop;
      const sectionHeight = sectionRect.height;

      let progress = 0;
      const middleOfScreen = viewportHeight / 2;
      const distanceFromMiddle = relativeSectionTop - middleOfScreen;

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

    scrollEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      scrollEl.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, []);

  if (preview && !isEditing && (experiences?.length ?? 0) === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.6 }}
      ref={careerLadderRef}
      className="group/section relative w-full rounded-[26px] border border-[#E5D7C4] bg-white p-4 md:p-6 dark:border-white/10 dark:bg-[#2A2520]"
    >
      {isEditing && (
        <CanvasSectionControls>
          {experiences.length >= 2 && (
            <CanvasSectionButton
              icon={<ChevronsUpDown className="h-3.5 w-3.5" />}
              tooltipText="Rearrange"
              onClick={() => openSidebar(sidebars.sortWorks)}
            />
          )}
          {experiences.length > 0 && (
            <CanvasSectionButton
              icon={<Plus className="h-3.5 w-3.5" />}
              label="Add Experience"
              onClick={() => openNewWork()}
            />
          )}
          <SectionVisibilityButton
            sectionId="works"
            showOnHoverWhenVisible
            className="h-8 w-8 rounded-full border border-[#E5D7C4] bg-white shadow-md hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520] dark:hover:bg-[#35302A]"
          />
        </CanvasSectionControls>
      )}
      <h2 className="font-dm-mono mb-6 text-[14px] font-medium text-[#7A736C] dark:text-[#B5AFA5]">
        CAREER LADDER
      </h2>

      {experiences.length === 0 ? (
        <div className="bg-background flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 px-4 py-16 text-center backdrop-blur-sm dark:border-white/10">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black/[0.03] dark:bg-white/[0.03]">
            <svg
              className="h-6 w-6 text-[#7A736C] dark:text-[#9E9893]"
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
          <h3 className="mb-1 text-[15px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
            No experience yet
          </h3>
          <p className="mb-5 max-w-[250px] text-[13px] text-[#7A736C] dark:text-[#9E9893]">
            Add your work experience to showcase your career journey.
          </p>
          {isEditing && (
            <Button
              onClick={() => openNewWork()}
              className="flex h-9 items-center gap-2 rounded-full bg-[#1A1A1A] px-5 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/90"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Experience
            </Button>
          )}
        </div>
      ) : (
        <div ref={ladderContainerRef} className="relative flex">
          {experiences.length > 1 && (
            <>
              <div
                className="absolute left-[1px] z-20 h-[54px] w-[40px]"
                style={{
                  top: `${characterPosition}px`,
                  willChange: "transform",
                }}
              >
                <img
                  src="/assets/svgs/character-me.svg"
                  alt="Character climbing"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="absolute top-3 bottom-0 left-0 flex w-[42px] flex-col items-start justify-between border-x-[5px] border-[#F0EDE7] bg-transparent py-1 dark:border-[#3A352E]">
                {[...Array(30)].map((_, i) => (
                  <div key={i} className="h-[5px] w-full bg-[#F0EDE7] dark:bg-[#3A352E]"></div>
                ))}
              </div>
            </>
          )}

          <div
            className={`space-y-6 ${experiences.length !== 1 ? "pl-16" : ""} relative z-10 w-full pt-1 pb-2`}
          >
            {experiences.map((experience) => (
              <MemoizedExperienceCard
                key={experience._id}
                experience={experience}
                isEditing={isEditing}
                expandedCards={expandedCards}
                onToggleExpand={toggleExpand}
                onDelete={handleDeleteExperience}
              />
            ))}
          </div>
        </div>
      )}

      <UnsavedChangesDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirmDiscard={confirmDelete}
        title="Delete Work Experience"
        description="Are you sure you want to delete this work experience? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </motion.div>
  );
}

export default React.memo(CanvasCareerLadder);
