import React, { useCallback, useEffect, useRef, useState, startTransition } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Move, Pencil, Trash2 } from "lucide-react";
import { Button } from "../../ui/button";
import { useGlobalContext } from "@/context/globalContext";
import { sidebars } from "@/lib/constant";
import { CanvasSectionControls, CanvasSectionButton } from "./CanvasSectionControls";
import { SectionVisibilityButton } from "@/components/section";
import { DEFAULT_PEGBOARD_IMAGES, DEFAULT_PEGBOARD_STICKERS } from "@/lib/aboutConstants";
import {
  ABOUT_STORY_CHAR_THRESHOLD,
  renderDescriptionLines,
  truncatePlainText,
} from "@/lib/aboutStoryPreview";

function playPegboardClick(type) {
  try {
    const audioContext = new window.AudioContext() || window.webkitAudioContext();
    const now = audioContext.currentTime;

    if (type === "grab") {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(1000, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
      osc.start(now);
      osc.stop(now + 0.03);
    } else {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    }
  } catch (e) {
    // Audio context not available or blocked
  }
}

function MoveOverlay({
  rounded = "rounded-[6px] md:rounded-[8px]",
  size = "w-4 h-4 md:w-5 md:h-5",
}) {
  return (
    <div
      className={`absolute inset-0 bg-black/5 dark:bg-black/20 ${rounded} pointer-events-none z-10 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
    >
      <div className="scale-90 rounded-full bg-white/80 p-2 shadow-sm backdrop-blur-md transition-transform duration-300 group-hover:scale-100 md:p-2.5 dark:bg-black/60">
        <Move className={`${size} text-gray-800 dark:text-gray-200`} />
      </div>
    </div>
  );
}

function CanvasAboutSection({ isEditing }) {
  const { userDetails, openSidebar } = useGlobalContext();
  const { about } = userDetails || {};
  const pegboardRef = useRef(null);
  const [zIndexes, setZIndexes] = useState({ 0: 10, 1: 20, 2: 10 });
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const reduceMotion = useReducedMotion();

  const storyText = about?.description?.trim() ?? "";
  const storyNeedsExpand = storyText.length > ABOUT_STORY_CHAR_THRESHOLD;
  const storyDisplayText =
    storyNeedsExpand && !aboutExpanded
      ? truncatePlainText(storyText, ABOUT_STORY_CHAR_THRESHOLD)
      : storyText;

  useEffect(() => {
    startTransition(() => setAboutExpanded(false));
  }, [storyText]);

  const images = about?.pegboardImages?.length > 0 ? about.pegboardImages : DEFAULT_PEGBOARD_IMAGES;

  const stickers =
    about?.pegboardStickers?.length > 0 ? about.pegboardStickers : DEFAULT_PEGBOARD_STICKERS;

  const bringToFront = useCallback((id) => {
    setZIndexes((prev) => {
      const maxZ = Math.max(...Object.values(prev));
      return { ...prev, [id]: maxZ + 1 };
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.9 }}
      className="group/section relative w-full rounded-[32px] border border-[#E5D7C4] bg-white p-6 dark:border-white/10 dark:bg-[#2A2520]"
    >
      {isEditing && (
        <CanvasSectionControls>
          <CanvasSectionButton
            icon={<Pencil className="h-3.5 w-3.5" />}
            label="Edit Story"
            onClick={() => openSidebar?.(sidebars.about)}
          />
          <SectionVisibilityButton
            sectionId="about"
            showOnHoverWhenVisible
            className="h-8 w-8 rounded-full border border-[#E5D7C4] bg-white shadow-md hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520] dark:hover:bg-[#35302A]"
          />
        </CanvasSectionControls>
      )}
      <h2 className="font-dm-mono mb-6 text-[14px] font-medium text-[#7A736C] dark:text-[#B5AFA5]">
        MY STORY
      </h2>

      {/* Pegboard Grid Background */}
      <div className="relative mb-8 w-full rounded-[32px] border border-black/5 bg-[#F7F4EF] dark:border-white/10 dark:bg-[#1E1B18]">
        {/* Invisible larger boundary for drag constraints allowing slight overflow */}
        <div className="pointer-events-none absolute -inset-6 md:-inset-10" ref={pegboardRef}></div>

        {/* Light Mode Grid */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[32px] dark:hidden"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            backgroundPosition: "center center",
          }}
        ></div>
        {/* Dark Mode Grid */}
        <div
          className="pointer-events-none absolute inset-0 hidden overflow-hidden rounded-[32px] dark:block"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            backgroundPosition: "center center",
          }}
        ></div>

        <div className="relative flex h-[260px] flex-row items-center justify-center gap-4 px-2 md:h-[320px] md:gap-10 md:p-4">
          {/* Image 1 - Left with L-shape tape (Portrait) */}
          {images[0] && (
            <motion.div
              drag
              dragConstraints={pegboardRef}
              dragMomentum={false}
              dragElastic={0}
              onDragStart={() => {
                bringToFront(0);
                playPegboardClick("grab");
              }}
              onDragEnd={() => playPegboardClick("drop")}
              onPointerDown={() => bringToFront(0)}
              whileDrag={{ scale: 1.05, cursor: "grabbing" }}
              initial={{ y: 10 }}
              style={{ zIndex: zIndexes[0] }}
              className="group relative aspect-[3/4] w-28 cursor-grab md:w-36"
            >
              <div
                className="pointer-events-none relative h-full w-full"
                style={{ transform: "rotate(-4deg)" }}
              >
                <div className="relative flex h-full w-full flex-col rounded-[12px] border border-black/5 bg-white p-1.5 shadow-sm transition-shadow group-hover:shadow-md md:rounded-[16px] md:p-2 dark:border-white/10 dark:bg-[#2A2520]">
                  <div className="relative h-full w-full">
                    <img
                      src={images[0].src || images[0].key}
                      alt="pegboard-1"
                      className="h-full w-full rounded-[6px] object-cover md:rounded-[8px]"
                      draggable="false"
                    />
                    <MoveOverlay />
                  </div>
                </div>
                {/* Top tape part */}
                <div
                  className="absolute -top-1 -left-2 z-20 h-5 w-12 bg-[#E8CF82]/90 shadow-sm backdrop-blur-sm md:h-6 md:w-16 dark:bg-[#B89B4D]/90"
                  style={{ transform: "rotate(-2deg)" }}
                ></div>
                {/* Side tape part */}
                <div
                  className="absolute top-3 -left-2 z-20 h-10 w-5 bg-[#E8CF82]/90 shadow-sm backdrop-blur-sm md:top-4 md:-left-3 md:h-12 md:w-6 dark:bg-[#B89B4D]/90"
                  style={{ transform: "rotate(2deg)" }}
                ></div>
              </div>
            </motion.div>
          )}

          {/* Image 2 - Center with Top Tape and Sticker (Squircle) */}
          {images[1] && (
            <motion.div
              drag
              dragConstraints={pegboardRef}
              dragMomentum={false}
              dragElastic={0}
              onDragStart={() => {
                bringToFront(1);
                playPegboardClick("grab");
              }}
              onDragEnd={() => playPegboardClick("drop")}
              onPointerDown={() => bringToFront(1)}
              whileDrag={{ scale: 1.05, cursor: "grabbing" }}
              initial={{ y: 15 }}
              style={{ zIndex: zIndexes[1] }}
              className="group relative aspect-square w-32 cursor-grab md:w-44"
            >
              <div
                className="pointer-events-none relative h-full w-full"
                style={{ transform: "rotate(6deg)" }}
              >
                <div className="relative flex h-full w-full flex-col rounded-[26px] border border-black/5 bg-white p-1.5 shadow-md transition-shadow group-hover:shadow-lg md:rounded-[32px] md:p-2 dark:border-white/10 dark:bg-[#2A2520]">
                  <div className="relative h-full w-full">
                    <img
                      src={images[1].src || images[1].key}
                      alt="pegboard-2"
                      className="h-full w-full rounded-[16px] object-cover md:rounded-[26px]"
                      draggable="false"
                    />
                    <MoveOverlay
                      rounded="rounded-[16px] md:rounded-[26px]"
                      size="w-5 h-5 md:w-6 md:h-6"
                    />
                  </div>
                </div>
                {/* Center tape */}
                <div
                  className="absolute -top-3 left-1/2 z-20 h-5 w-16 -translate-x-1/2 bg-[#DFCDAA]/90 shadow-sm backdrop-blur-sm md:h-6 md:w-20 dark:bg-[#9B8C73]/90"
                  style={{ transform: "rotate(-3deg)" }}
                ></div>

                {/* Sticker Accent — temporarily hidden */}
              </div>
            </motion.div>
          )}

          {/* Image 3 - Right with Long Top Tape (Portrait) */}
          {images[2] && (
            <motion.div
              drag
              dragConstraints={pegboardRef}
              dragMomentum={false}
              dragElastic={0}
              onDragStart={() => {
                bringToFront(2);
                playPegboardClick("grab");
              }}
              onDragEnd={() => playPegboardClick("drop")}
              onPointerDown={() => bringToFront(2)}
              whileDrag={{ scale: 1.05, cursor: "grabbing" }}
              initial={{ y: -10 }}
              style={{ zIndex: zIndexes[2] }}
              className="group relative aspect-[3/4] w-28 cursor-grab md:w-36"
            >
              <div
                className="pointer-events-none relative h-full w-full"
                style={{ transform: "rotate(-2deg)" }}
              >
                <div className="relative flex h-full w-full flex-col rounded-[12px] border border-black/5 bg-white p-1.5 shadow-sm transition-shadow group-hover:shadow-md md:rounded-[16px] md:p-2 dark:border-white/10 dark:bg-[#2A2520]">
                  <div className="relative h-full w-full">
                    <img
                      src={images[2].src || images[2].key}
                      alt="pegboard-3"
                      className="h-full w-full rounded-[6px] object-cover md:rounded-[8px]"
                      draggable="false"
                    />
                    <MoveOverlay />
                  </div>
                </div>
                {/* Long horizontal tape */}
                <div
                  className="absolute -top-3 -left-2 z-20 h-5 w-32 bg-[#D3C4A9]/90 shadow-sm backdrop-blur-sm md:-top-4 md:-left-4 md:h-6 md:w-44 dark:bg-[#8D826B]/90"
                  style={{ transform: "rotate(1deg)" }}
                ></div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <p className="pointer-events-none -mt-2 mb-8 text-center text-[10px] font-medium tracking-widest text-[#7A736C]/70 uppercase dark:text-[#B5AFA5]/60">
        Try moving things around :)
      </p>

      {/* Story Text */}
      <div className="flex flex-col gap-4">
        {storyText ? (
          storyNeedsExpand ? (
            <div className="flex flex-col gap-0">
              <div
                className={`relative min-w-0 overflow-hidden ${!aboutExpanded ? "max-h-[5em]" : ""}`}
              >
                <p className="text-[16px] leading-relaxed break-words text-[#7A736C] dark:text-[#B5AFA5]">
                  {renderDescriptionLines(storyDisplayText)}
                </p>
                {!aboutExpanded && (
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent dark:from-[#2A2520]"
                    aria-hidden
                  />
                )}
              </div>
              <button
                type="button"
                onClick={() => setAboutExpanded((v) => !v)}
                aria-expanded={aboutExpanded}
                className="mt-3 flex items-center gap-1.5 self-start rounded-md text-[13px] font-medium text-[#1A1A1A] opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-[#1A1A1A]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none dark:text-[#F0EDE7] dark:focus-visible:ring-white/35 dark:focus-visible:ring-offset-[#2A2520]"
              >
                {aboutExpanded ? "View less" : "View more"}
                <motion.svg
                  animate={{ rotate: aboutExpanded ? 180 : 0 }}
                  transition={
                    reduceMotion ? { duration: 0 } : { duration: 0.3, ease: [0.23, 1, 0.32, 1] }
                  }
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="m6 9 6 6 6-6" />
                </motion.svg>
              </button>
            </div>
          ) : (
            <p className="text-[16px] leading-relaxed text-[#7A736C] dark:text-[#B5AFA5]">
              {renderDescriptionLines(storyText)}
            </p>
          )
        ) : isEditing ? (
          <button
            onClick={() => openSidebar?.(sidebars.about)}
            className="text-left text-[13px] text-[#7A736C] transition-colors hover:text-[#1A1A1A] dark:text-[#B5AFA5] dark:hover:text-white"
          >
            Click here to add your story...
          </button>
        ) : null}
      </div>
    </motion.div>
  );
}

export default React.memo(CanvasAboutSection);
