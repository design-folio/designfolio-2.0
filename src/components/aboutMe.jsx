/* eslint-disable @next/next/no-img-element */
import React, { useRef } from "react";
import Section from "./section";
import { modals } from "@/lib/constant";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export default function AboutMe({ userDetails, edit = false, openModal }) {
  const isMobile = useIsMobile();
  const pinBoardRef = useRef(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const about =
    userDetails?.about ??
    userDetails?.aboutMe ??
    userDetails?.about_me ??
    "";

  const hasAbout = typeof about === "string" && about.trim().length > 0;

  // No audio assets in this repo; keep hooks as no-ops.
  const playPick = () => { };
  const playPlace = () => { };

  return (
    <Section
      title="About Me"
      edit={edit}
      onClick={() => openModal?.(modals.about)}
      className="bg-white border-0 rounded-2xl p-6 mt-0 mb-3 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_0_40px_rgba(0,0,0,0.015)] backdrop-blur-0 dark:bg-[#0F1115] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_0_40px_rgba(0,0,0,0.35)]"
      headerClassName="items-start"
      contentClassName="mt-6"
    >
      <div className="space-y-4 text-foreground-landing/80 leading-relaxed mb-8">
        <p className="whitespace-pre-wrap" data-testid="text-about-description-1">
          {hasAbout
            ? about
            : edit ? "Write something about yourself here..." : ""}
        </p>
      </div>

      {/* Pin Board (Pegboard) - ported from v3 Dashboard */}
      <div className="relative group/pegboard mb-8">
        {/* Board depth */}
        <div className="absolute inset-0 bg-black/5 rounded-2xl translate-y-[2px] translate-x-[1px] blur-[3px] pointer-events-none" />

        <div
          ref={pinBoardRef}
          className="relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/9] bg-[#FFFFFF] dark:bg-[#0F1115] rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.02)] z-10 overflow-visible border border-black/[0.03] dark:border-white/[0.06]"
        >
          {/* Pegboard holes */}
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{
              backgroundImage:
                `radial-gradient(circle, ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)"
                } 2px, transparent 2px)`,
              backgroundSize: "36px 36px",
              backgroundPosition: "center",
              padding: "18px",
              backgroundOrigin: "content-box",
              backgroundClip: "content-box",
            }}
          />

          {/* Subtle material grain (external texture) */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] overflow-hidden" />

          {/* Lighting */}
          <div
            className={cn(
              "absolute inset-0 pointer-events-none overflow-hidden",
              // match v3 exactly in light mode
              !isDark && "bg-gradient-to-tr from-black/[0.01] via-transparent to-white/[0.05]",
              // subtle dark-mode variant (kept minimal)
              isDark && "bg-gradient-to-tr from-white/[0.03] via-transparent to-black/[0.25]"
            )}
          />

          {/* Photo 1 */}
          <motion.div
            drag
            dragMomentum={false}
            dragConstraints={pinBoardRef}
            dragElastic={0.1}
            onDragStart={playPick}
            onDragEnd={playPlace}
            initial={{
              rotate: -5,
              left: isMobile ? "15%" : "20%",
              top: isMobile ? "18%" : "25%",
              x: "-50%",
              y: "-50%",
            }}
            animate={{
              left: isMobile ? "15%" : "20%",
              top: isMobile ? "18%" : "25%",
              x: "-50%",
              y: "-50%",
            }}
            className="absolute w-24 sm:w-28 md:w-36 lg:w-40 aspect-[4/3] p-1 bg-white dark:bg-[#141824] shadow-[0_8px_16px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.02)] cursor-grab active:cursor-grabbing z-10 rounded-sm"
            whileDrag={{
              scale: 1.05,
              zIndex: 50,
              boxShadow:
                "0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)",
            }}
          >
            <div className="w-full h-full overflow-hidden rounded-sm">
              <img
                src="/assets/portraits/portrait1.png"
                alt="Portrait 1"
                className="w-full h-full object-cover pointer-events-none"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/assets/png/project1.png";
                }}
              />
            </div>
            <Pin color="#FF553E" />
          </motion.div>

          {/* Photo 2 */}
          <motion.div
            drag
            dragMomentum={false}
            dragConstraints={pinBoardRef}
            dragElastic={0.1}
            onDragStart={playPick}
            onDragEnd={playPlace}
            initial={{
              rotate: 3,
              left: isMobile ? "72%" : "80%",
              top: isMobile ? "22%" : "30%",
              x: "-50%",
              y: "-50%",
            }}
            animate={{
              left: isMobile ? "72%" : "80%",
              top: isMobile ? "22%" : "30%",
              x: "-50%",
              y: "-50%",
            }}
            className="absolute w-28 sm:w-32 md:w-40 lg:w-44 aspect-square p-1 bg-white dark:bg-[#141824] shadow-[0_8px_16px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.02)] cursor-grab active:cursor-grabbing z-20 rounded-sm"
            whileDrag={{
              scale: 1.05,
              zIndex: 50,
              boxShadow:
                "0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)",
            }}
          >
            <div className="w-full h-full overflow-hidden rounded-sm">
              <img
                src="/assets/portraits/portrait2.png"
                alt="Portrait 2"
                className="w-full h-full object-cover pointer-events-none"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/assets/png/project3.png";
                }}
              />
            </div>
            <Pin color="#FF553E" />
          </motion.div>

          {/* Photo 3 */}
          <motion.div
            drag
            dragMomentum={false}
            dragConstraints={pinBoardRef}
            dragElastic={0.1}
            onDragStart={playPick}
            onDragEnd={playPlace}
            initial={{
              rotate: -2,
              left: isMobile ? "18%" : "25%",
              top: isMobile ? "58%" : "75%",
              x: "-50%",
              y: "-50%",
            }}
            animate={{
              left: isMobile ? "18%" : "25%",
              top: isMobile ? "58%" : "75%",
              x: "-50%",
              y: "-50%",
            }}
            className="absolute w-24 sm:w-28 md:w-36 lg:w-40 aspect-[3/4] p-1 bg-white dark:bg-[#141824] shadow-[0_8px_16px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.02)] cursor-grab active:cursor-grabbing z-30 rounded-sm"
            whileDrag={{
              scale: 1.05,
              zIndex: 50,
              boxShadow:
                "0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)",
            }}
          >
            <div className="w-full h-full overflow-hidden rounded-sm">
              <img
                src="/assets/portraits/portrait3.png"
                alt="Portrait 3"
                className="w-full h-full object-cover pointer-events-none"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/assets/png/project4.png";
                }}
              />
            </div>
            <Pin color="#FF553E" />
          </motion.div>

          {/* Photo 4 */}
          <motion.div
            drag
            dragMomentum={false}
            dragConstraints={pinBoardRef}
            dragElastic={0.1}
            onDragStart={playPick}
            onDragEnd={playPlace}
            initial={{
              rotate: 4,
              left: isMobile ? "68%" : "75%",
              top: isMobile ? "68%" : "75%",
              x: "-50%",
              y: "-50%",
            }}
            animate={{
              left: isMobile ? "68%" : "75%",
              top: isMobile ? "68%" : "75%",
              x: "-50%",
              y: "-50%",
            }}
            className="absolute w-20 sm:w-24 md:w-32 lg:w-36 aspect-[4/3] p-1 bg-white dark:bg-[#141824] shadow-[0_8px_16px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.02)] cursor-grab active:cursor-grabbing z-40 rounded-sm"
            whileDrag={{
              scale: 1.05,
              zIndex: 50,
              boxShadow:
                "0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)",
            }}
          >
            <div className="w-full h-full overflow-hidden rounded-sm">
              <img
                src="/assets/portraits/portrait4.png"
                alt="Portrait 4"
                className="w-full h-full object-cover pointer-events-none"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/assets/png/project5.png";
                }}
              />
            </div>
            <Pin color="#FF553E" />
          </motion.div>

          {/* Sticker 1 */}
          <motion.div
            drag
            dragMomentum={false}
            dragConstraints={pinBoardRef}
            dragElastic={0.1}
            onDragStart={playPick}
            onDragEnd={playPlace}
            initial={{
              rotate: -15,
              left: isMobile ? "45%" : "44%",
              top: isMobile ? "40%" : "48%",
              x: "-50%",
              y: "-50%",
            }}
            animate={{
              left: isMobile ? "45%" : "44%",
              top: isMobile ? "40%" : "48%",
              x: "-50%",
              y: "-50%",
            }}
            className="absolute w-20 sm:w-24 md:w-32 lg:w-36 aspect-square cursor-grab active:cursor-grabbing z-50"
            whileDrag={{ scale: 1.1, zIndex: 60 }}
          >
            <img
              src="/assets/portraits/sticker1.png"
              alt="Sticker 1"
              className="w-full h-full object-contain pointer-events-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.1)]"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/assets/svgs/star.svg";
              }}
            />
            <Pin color="#3B82F6" small />
          </motion.div>

          {/* Sticker 2 */}
          <motion.div
            drag
            dragMomentum={false}
            dragConstraints={pinBoardRef}
            dragElastic={0.1}
            onDragStart={playPick}
            onDragEnd={playPlace}
            initial={{
              rotate: 10,
              left: isMobile ? "50%" : "55%",
              top: isMobile ? "85%" : "60%",
            }}
            style={{ x: "-50%", y: "-50%" }}
            className="absolute w-24 sm:w-28 md:w-36 lg:w-40 aspect-square cursor-grab active:cursor-grabbing z-50"
            whileDrag={{ scale: 1.1, zIndex: 60 }}
          >
            <img
              src="/assets/portraits/sticker2.png"
              alt="Sticker 2"
              className="w-full h-full object-contain pointer-events-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.1)]"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/assets/svgs/quote.svg";
              }}
            />
            <Pin color="#3B82F6" small />
          </motion.div>
        </div>
      </div>

      {/* Caption is outside pegboard wrapper in v3 */}
      <div className="text-center text-[10px] text-foreground-landing/20 font-medium tracking-widest uppercase pointer-events-none mb-4">
        Try moving things around :)
      </div>
    </Section>
  );
}

function Pin({ color = "#FF553E", small = false }) {
  return (
    <div
      className={cn(
        "absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none z-20",
        small ? "-top-2 w-4 h-4" : "-top-3 w-6 h-6"
      )}
    >
      <div
        className={cn(
          "rounded-full relative",
          small ? "w-3.5 h-3.5" : "w-5 h-5",
          // v3: different shadow strength for sticker pins
          small
            ? "shadow-[0_1.5px_3px_rgba(0,0,0,0.2),inset_0_-0.75px_1.5px_rgba(0,0,0,0.2)]"
            : "shadow-[0_2px_4px_rgba(0,0,0,0.2),inset_0_-1px_2px_rgba(0,0,0,0.2)]"
        )}
        style={{ backgroundColor: color }}
      >
        <div
          className={cn(
            // v3: smaller highlight for sticker pin
            small
              ? "absolute top-0.5 left-1 w-1 h-1"
              : "absolute top-1 left-1.5 w-1.5 h-1.5",
            "bg-white/40 rounded-full blur-[0.5px]"
          )}
        />
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/10 to-transparent" />
      </div>
      <div
        className={cn(
          // match v3 needle styling
          "absolute w-[1px] bg-black/20 blur-[0.5px] -rotate-12",
          small ? "top-3 h-1.5" : "top-4 h-2"
        )}
      />
    </div>
  );
}

