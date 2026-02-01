/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { Button } from "@/components/ui/buttonNew";
import DfImage from "./image";
import Link from "next/link";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import { capitalizeWords } from "@/lib/capitalizeText";
import { PencilIcon, Sparkle } from "lucide-react";
import MemoLeftArrow from "./icons/LeftArrow";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Magnetic } from "@/components/ui/magnetic";

export default function Profile({
  preview = false,
  edit = false,
  userDetails = null,
  openModal,
  embeddedPreview = false,
}) {
  const controls = useAnimation();
  const skillsRef = useRef(null);
  const avatarImgRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const avatarSrc = useMemo(() => getUserAvatarImage(userDetails), [userDetails]);

  // Ensure avatar never stays invisible (cached images may not fire onLoad)
  useEffect(() => {
    setImageLoaded(false);
  }, [avatarSrc]);

  useEffect(() => {
    // If the image is already cached/complete, reveal it immediately.
    const img = avatarImgRef.current;
    if (img && img.complete) {
      setImageLoaded(true);
    }
  }, [avatarSrc]);

  const skills = useMemo(
    () =>
      userDetails?.skills?.length
        ? userDetails.skills.map((skill) => skill.label)
        : [],
    [userDetails?.skills]
  );

  useEffect(() => {
    const skillElementWidthIncludingMargin = 100;
    const totalWidth =
      (userDetails?.skills?.length || 0) * skillElementWidthIncludingMargin * 3;
    controls.start({
      x: [0, -totalWidth],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: totalWidth / 20,
          ease: "linear",
        },
      },
    });
  }, [controls, userDetails?.skills]);

  return (
    <TooltipProvider>
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <div
          className={cn(
            "bg-df-section-card-bg-color shadow-df-section-card-shadow rounded-2xl overflow-hidden items-center relative backdrop-blur-sm border-0"
          )}
        >
          {/* Preview Mode: show Exit preview only when not embedded (e.g. ResultPopup) */}
          {preview && !embeddedPreview && (
            <div className="p-4">
              <Link href={"/builder"}>
                <Button
                  variant="secondary"
                  className="rounded-full px-4 h-9 text-sm font-medium"
                >
                  <MemoLeftArrow className="!size-2.5" />
                  Exit preview
                </Button>
              </Link>
            </div>
          )}

          {/* Edit Button */}
          {edit && (
            <div className="absolute top-4 right-4 z-10">
              <Button
                variant="secondary"
                size="icon"
                className="h-11 w-11 rounded-full"
                onClick={() => openModal("onboarding")}
              >
                <PencilIcon className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Profile Info */}
          <div className="p-6 sm:p-8 pb-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              {/* Avatar Container */}
              <Tooltip delayDuration={300}>
                <Magnetic intensity={0.2} range={100}>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }}
                      animate={{
                        opacity: 1,
                        filter: "blur(0px)",
                        scale: 1,
                        rotateX: isHovering ? mousePosition.y * -20 : 0,
                        rotateY: isHovering ? mousePosition.x * 20 : 0,
                      }}
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)"
                      }}
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
                        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
                        setMousePosition({ x, y });
                      }}
                      onMouseEnter={() => setIsHovering(true)}
                      onMouseLeave={() => {
                        setIsHovering(false);
                        setMousePosition({ x: 0, y: 0 });
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 150,
                        damping: 20,
                        mass: 0.5
                      }}

                      className={cn("w-24 h-24 sm:w-32 sm:h-32 rounded-2xl flex items-center justify-center relative overflow-hidden shrink-0", !userDetails?.avatar ? "bf-[#F5F3F1] dark:bg-df-bg-color" : "")}
                      style={{
                        perspective: "1000px",
                        transformStyle: "preserve-3d"
                      }}
                      data-testid="avatar-profile"
                    >
                      {!imageLoaded && (
                        <div
                          className="absolute inset-0 rounded-2xl"
                          style={{
                            background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
                            animation: 'shimmer 1.5s infinite'
                          }}
                        />
                      )}
                      <img
                        ref={avatarImgRef}
                        src={avatarSrc}
                        alt={userDetails?.firstName || "Avatar"}
                        className="w-full h-full object-cover"
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageLoaded(true)}
                        style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
                      />
                    </motion.div>
                  </TooltipTrigger>
                </Magnetic>
                <TooltipContent
                  side="top"
                  sideOffset={8}
                  avoidCollisions={true}
                  className="bg-tooltip-bg-color text-tooltip-text-color border-0 px-4 py-2 rounded-xl flex items-center gap-2 shadow-xl"
                >
                  <span className="text-sm font-medium">Happy to have you here</span>
                  <img src="/assets/png/handshake.png" alt="Handshake" className="w-5 h-5 object-contain" />
                </TooltipContent>
              </Tooltip>

              {/* Text Section */}
              <div className="flex-1">
                <motion.h1
                  initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
                  className="text-2xl sm:text-3xl font-semibold mb-2 font-gsans text-df-heading-color break-words"
                  data-testid="text-user-name"
                >
                  {userDetails?.introduction || `Hey, I'm ${capitalizeWords(userDetails?.firstName) || ""}`}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
                  className="text-sm sm:text-base text-df-description-color break-words leading-relaxed max-w-2xl"
                  data-testid="text-user-role"
                >
                  {userDetails?.bio || "Write your intro here..."}
                </motion.p>
              </div>
            </div>
          </div>



          {/* Skills banner strip */}
          {skills?.length > 0 && (
            <div
              className="relative overflow-hidden border-t border-border/10 py-3 bg-df-profile-strip-bg-color rounded-b-2xl"
            >
              <motion.div
                ref={skillsRef}
                animate={controls}
                initial={{ x: 0 }}
                className="flex px-8 whitespace-nowrap opacity-40"
              >
                {[
                  ...skills,
                  ...skills,
                  ...skills,
                  ...skills,
                  ...skills,
                  ...skills,
                  ...skills,
                  ...skills,
                  ...skills,
                  ...skills,
                  ...skills,
                  ...skills,
                ].map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 shrink-0 mr-3"
                  >
                    <span className="text-xs font-medium tracking-normal text-df-ink-color whitespace-nowrap uppercase">
                      {skill}
                    </span>
                    <Sparkle className="w-2.5 h-2.5 text-df-ink-color fill-df-ink-color" />
                  </div>
                ))}
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
