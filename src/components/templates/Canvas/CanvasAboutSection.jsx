import React, { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Move, Pencil, Trash2 } from "lucide-react";
import { Button } from "../../ui/button";
import { useGlobalContext } from "@/context/globalContext";
import { sidebars } from "@/lib/constant";
import { CanvasSectionControls, CanvasSectionButton } from "./CanvasSectionControls";
import { SectionVisibilityButton } from "@/components/section";
import {
  DEFAULT_PEGBOARD_IMAGES,
  DEFAULT_PEGBOARD_STICKERS,
} from "@/lib/aboutConstants";

function playPegboardClick(type) {
  try {
    const audioContext =
      new window.AudioContext() || window.webkitAudioContext();
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



function MoveOverlay({ rounded = "rounded-[6px] md:rounded-[8px]", size = "w-4 h-4 md:w-5 md:h-5" }) {
  return (
    <div className={`absolute inset-0 bg-black/5 dark:bg-black/20 ${rounded} flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none`}>
      <div className="bg-white/80 dark:bg-black/60 backdrop-blur-md p-2 md:p-2.5 rounded-full shadow-sm scale-90 group-hover:scale-100 transition-transform duration-300">
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

  const images =
    about?.pegboardImages?.length > 0
      ? about.pegboardImages
      : DEFAULT_PEGBOARD_IMAGES;

  const stickers =
    about?.pegboardStickers?.length > 0
      ? about.pegboardStickers
      : DEFAULT_PEGBOARD_STICKERS;

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
      className="bg-white dark:bg-[#2A2520] rounded-[32px] border border-[#E5D7C4] dark:border-white/10 p-6 w-full relative group/section"
    >
      {isEditing && (
        <CanvasSectionControls>
          <CanvasSectionButton
            icon={<Pencil className="w-3.5 h-3.5" />}
            label="Edit Story"
            onClick={() => openSidebar?.(sidebars.about)}
          />
          <SectionVisibilityButton
            sectionId="about"
            showOnHoverWhenVisible
            className="w-8 h-8 rounded-full bg-white dark:bg-[#2A2520] shadow-md border border-[#E5D7C4] dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#35302A]"
          />
        </CanvasSectionControls>
      )}
      <h2
        className="text-[#7A736C] dark:text-[#B5AFA5] font-dm-mono font-medium text-[14px] mb-6"
      >
        MY STORY
      </h2>

      {/* Pegboard Grid Background */}
      <div className="relative w-full mb-8 rounded-[32px] border border-black/5 dark:border-white/10 bg-[#F7F4EF] dark:bg-[#1E1B18]">
        {/* Invisible larger boundary for drag constraints allowing slight overflow */}
        <div
          className="absolute -inset-6 md:-inset-10 pointer-events-none"
          ref={pegboardRef}
        ></div>

        {/* Light Mode Grid */}
        <div
          className="absolute inset-0 dark:hidden pointer-events-none rounded-[32px] overflow-hidden"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            backgroundPosition: "center center",
          }}
        ></div>
        {/* Dark Mode Grid */}
        <div
          className="absolute inset-0 hidden dark:block pointer-events-none rounded-[32px] overflow-hidden"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            backgroundPosition: "center center",
          }}
        ></div>

        <div className="relative h-[260px] md:h-[320px] flex flex-row items-center justify-center px-2 md:p-4 gap-4 md:gap-10">
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
              className="relative w-28 md:w-36 aspect-[3/4] group cursor-grab"
            >

              <div
                className="w-full h-full pointer-events-none relative"
                style={{ transform: "rotate(-4deg)" }}
              >
                <div className="w-full h-full bg-white dark:bg-[#2A2520] p-1.5 md:p-2 rounded-[12px] md:rounded-[16px] shadow-sm border border-black/5 dark:border-white/10 flex flex-col relative group-hover:shadow-md transition-shadow">
                  <div className="relative w-full h-full">
                    <img
                      src={images[0].src || images[0].key}
                      alt="pegboard-1"
                      className="w-full h-full object-cover rounded-[6px] md:rounded-[8px]"
                      draggable="false"
                    />
                    <MoveOverlay />
                  </div>
                </div>
                {/* Top tape part */}
                <div
                  className="absolute -top-1 -left-2 w-12 md:w-16 h-5 md:h-6 bg-[#E8CF82]/90 dark:bg-[#B89B4D]/90 backdrop-blur-sm shadow-sm z-20"
                  style={{ transform: "rotate(-2deg)" }}
                ></div>
                {/* Side tape part */}
                <div
                  className="absolute top-3 md:top-4 -left-2 md:-left-3 w-5 md:w-6 h-10 md:h-12 bg-[#E8CF82]/90 dark:bg-[#B89B4D]/90 backdrop-blur-sm shadow-sm z-20"
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
              className="relative w-32 md:w-44 aspect-square group cursor-grab"
            >

              <div
                className="w-full h-full pointer-events-none relative"
                style={{ transform: "rotate(6deg)" }}
              >
                <div className="w-full h-full bg-white dark:bg-[#2A2520] p-1.5 md:p-2 rounded-[24px] md:rounded-[32px] shadow-md border border-black/5 dark:border-white/10 flex flex-col relative group-hover:shadow-lg transition-shadow">
                  <div className="relative w-full h-full">
                    <img
                      src={images[1].src || images[1].key}
                      alt="pegboard-2"
                      className="w-full h-full object-cover rounded-[16px] md:rounded-[24px]"
                      draggable="false"
                    />
                    <MoveOverlay
                      rounded="rounded-[16px] md:rounded-[24px]"
                      size="w-5 h-5 md:w-6 md:h-6"
                    />
                  </div>
                </div>
                {/* Center tape */}
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 md:w-20 h-5 md:h-6 bg-[#DFCDAA]/90 dark:bg-[#9B8C73]/90 backdrop-blur-sm shadow-sm z-20"
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
              className="relative w-28 md:w-36 aspect-[3/4] group cursor-grab"
            >

              <div
                className="w-full h-full pointer-events-none relative"
                style={{ transform: "rotate(-2deg)" }}
              >
                <div className="w-full h-full bg-white dark:bg-[#2A2520] p-1.5 md:p-2 rounded-[12px] md:rounded-[16px] shadow-sm border border-black/5 dark:border-white/10 flex flex-col relative group-hover:shadow-md transition-shadow">
                  <div className="relative w-full h-full">
                    <img
                      src={images[2].src || images[2].key}
                      alt="pegboard-3"
                      className="w-full h-full object-cover rounded-[6px] md:rounded-[8px]"
                      draggable="false"
                    />
                    <MoveOverlay />
                  </div>
                </div>
                {/* Long horizontal tape */}
                <div
                  className="absolute -top-3 md:-top-4 -left-2 md:-left-4 w-32 md:w-44 h-5 md:h-6 bg-[#D3C4A9]/90 dark:bg-[#8D826B]/90 backdrop-blur-sm shadow-sm z-20"
                  style={{ transform: "rotate(1deg)" }}
                ></div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <p className="mb-8 -mt-2 text-center text-[10px] font-medium tracking-widest uppercase text-[#7A736C]/70 dark:text-[#B5AFA5]/60 pointer-events-none">
        Try moving things around :)
      </p>

      {/* Story Text */}
      <div className="space-y-4">
        {about?.description ? (
          <p className="text-[#7A736C] dark:text-[#B5AFA5] text-[16px] leading-relaxed">
            {about.description.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
          </p>
        ) : isEditing ? (
          <button
            onClick={() => openSidebar?.(sidebars.about)}
            className="text-left text-[13px] text-[#7A736C] dark:text-[#B5AFA5] hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
          >
            Click here to add your story...
          </button>
        ) : (
          <p className="text-[13px] text-[#7A736C] dark:text-[#B5AFA5]">
            Click here to add your story...
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default React.memo(CanvasAboutSection);
