import React, { useRef } from "react";
import Section from "./section";
import { sidebars } from "@/lib/constant";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePegboardSounds } from "@/hooks/use-pegboard-sounds";
import { DEFAULT_PEGBOARD_IMAGES, DEFAULT_PEGBOARD_STICKERS } from "@/lib/aboutConstants";
import { extractTextFromTipTap } from "@/lib/tiptapUtils";


export default function AboutMe({
  userDetails,
  edit = false,
  openModal,
  variant, // "default" | "pegboard"
}) {
  return (
    <Section
      title="About me"
      edit={edit}
      onClick={() => openModal?.(sidebars.about)}
      className="mt-0 mb-3"
      sectionId="about"
    >
      <AboutMeContent userDetails={userDetails} edit={edit} variant={variant} />
    </Section>
  );
}

export function AboutMeContent({
  userDetails,
  edit = false,
  variant, // "default" | "pegboard"
  showCaption = true,
  className = "",
  textClassName = "text-foreground-landing/80",
}) {
  const effectiveVariant = variant ?? "pegboard";

  const aboutObj = userDetails?.about;
  const description = aboutObj?.description || "";
  const images = aboutObj?.pegboardImages?.length > 0 ? aboutObj.pegboardImages : DEFAULT_PEGBOARD_IMAGES;
  const stickers = aboutObj?.pegboardStickers?.length > 0 ? aboutObj.pegboardStickers : DEFAULT_PEGBOARD_STICKERS;

  const hasDescription = description.trim().length > 0;

  return (
    <div className={cn("space-y-4", className)}>
      <div className={cn("space-y-4 leading-relaxed", textClassName)}>
        <p className="leading-relaxed whitespace-pre-wrap text-foreground-landing/80" data-testid="text-about-description-1">
          {hasDescription ? description : edit ? "Write something about yourself here..." : ""}
        </p>
      </div>

      {effectiveVariant === "pegboard" && (
        <div className="mt-6">
          <Pegboard images={images} stickers={stickers} />
          {showCaption && (
            <div className={cn("mb-4 text-center text-[10px] font-medium tracking-widest uppercase pointer-events-none", textClassName, "text-foreground-landing/20")}>
              Try moving things around :)
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Pegboard({ images = [], stickers = [] }) {
  const pinBoardRef = useRef(null);
  const { playPick, playPlace } = usePegboardSounds();

  // Same layout on mobile and desktop: four corners + center stickers (avoids mobile overlap)
  const imageConfigs = [
    {
      initial: { rotate: -5, left: "20%", top: "25%", x: "-50%", y: "-50%" },
      className: "w-24 sm:w-28 md:w-36 lg:w-40 aspect-[4/3]",
      fallbackSrc: "/assets/png/project1.png",
      pinColor: "#FF553E"
    },
    {
      initial: { rotate: 3, left: "80%", top: "30%", x: "-50%", y: "-50%" },
      className: "w-28 sm:w-32 md:w-40 lg:w-44 aspect-square",
      fallbackSrc: "/assets/png/project3.png",
      pinColor: "#FF553E"
    },
    {
      initial: { rotate: -2, left: "25%", top: "75%", x: "-50%", y: "-50%" },
      className: "w-24 sm:w-28 md:w-36 lg:w-40 aspect-[3/4]",
      fallbackSrc: "/assets/png/project4.png",
      pinColor: "#FF553E"
    },
    {
      initial: { rotate: 4, left: "75%", top: "75%", x: "-50%", y: "-50%" },
      className: "w-20 sm:w-24 md:w-32 lg:w-36 aspect-[4/3]",
      fallbackSrc: "/assets/png/project5.png",
      pinColor: "#FF553E"
    }
  ];

  const stickerConfigs = [
    {
      initial: { rotate: -15, left: "44%", top: "48%", x: "-50%", y: "-50%" },
      className: "absolute w-20 sm:w-24 md:w-32 lg:w-36 aspect-square cursor-grab active:cursor-grabbing z-50",
      fallbackSrc: "/assets/svgs/star.svg"
    },
    {
      initial: { rotate: 10, left: "55%", top: "60%", x: "-50%", y: "-50%" },
      className: "absolute w-24 sm:w-28 md:w-36 lg:w-40 aspect-square cursor-grab active:cursor-grabbing z-50",
      fallbackSrc: "/assets/svgs/quote.svg"
    }
  ];

  return (
    <div className="relative group/pegboard mb-8">
      {/* Board depth */}
      <div className="absolute inset-0 bg-black/5 rounded-2xl translate-y-[2px] translate-x-[1px] blur-[3px] pointer-events-none" />

      <div
        ref={pinBoardRef}
        className="relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/9] bg-white dark:bg-df-add-card-bg-color rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.02)] z-10 overflow-visible border border-black/[0.03]"
      >
        {/* Pegboard holes */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl bg-center p-[18px] [background-size:36px_36px] [background-origin:content-box] [background-clip:content-box] bg-[radial-gradient(circle,rgba(0,0,0,0.10)_2px,transparent_2px)] dark:bg-[radial-gradient(circle,#30323C_2px,transparent_2px)]"
        />

        {/* Lighting */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden bg-gradient-to-tr from-black/[0.01] via-transparent to-white/[0.05]" />

        {/* Render Images */}
        {imageConfigs.map((config, index) => {
          const img = images[index];
          if (!img) return null;
          return (
            <PegboardItem
              key={`img-${index}`}
              pinBoardRef={pinBoardRef}
              onDragStart={playPick}
              onDragEnd={playPlace}
              initial={config.initial}
              className={config.className}
              imgSrc={img.src}
              fallbackSrc={config.fallbackSrc}
              pinColor={config.pinColor}
            />
          );
        })}

        {/* Render Stickers */}
        {stickerConfigs.map((config, index) => {
          const sticker = stickers[index];
          if (!sticker) return null;
          return (
            <motion.div
              key={`sticker-${index}`}
              drag
              dragMomentum={false}
              dragConstraints={pinBoardRef}
              dragElastic={0.1}
              onDragStart={playPick}
              onDragEnd={playPlace}
              initial={config.initial}
              animate={config.initial}
              className={config.className}
              whileDrag={{ scale: 1.1, zIndex: 60 }}
            >
              <img
                src={sticker.src}
                alt={`Sticker ${index + 1}`}
                className="w-full h-full object-contain pointer-events-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.1)]"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = config.fallbackSrc;
                }}
              />
              <Pin color="#3B82F6" small />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function PegboardItem({
  pinBoardRef,
  onDragStart,
  onDragEnd,
  initial,
  className,
  imgSrc,
  fallbackSrc,
  alt,
  pinColor,
}) {
  return (
    <motion.div
      drag
      dragMomentum={false}
      dragConstraints={pinBoardRef}
      dragElastic={0.1}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      initial={initial}
      animate={initial}
      className={cn(
        "absolute p-1 bg-white shadow-[0_8px_16px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.02)] cursor-grab active:cursor-grabbing rounded-sm",
        className
      )}
      whileDrag={{
        scale: 1.05,
        zIndex: 50,
        boxShadow: "0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)",
      }}
    >
      <div className="w-full h-full overflow-hidden rounded-sm">
        <img
          src={imgSrc}
          alt={alt}
          className="w-full h-full object-cover pointer-events-none"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = fallbackSrc;
          }}
        />
      </div>
      <Pin color={pinColor} />
    </motion.div>
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

