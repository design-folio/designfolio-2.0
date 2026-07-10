import { Avatar } from "@/components/ui/avatar";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Button from "@/components/button";
import { EditIcon } from "lucide-react";
import { useGlobalContext } from "@/context/globalContext";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const SpotlightHero = ({ userDetails, edit }) => {
  const [isLoaded, setIsLoaded] = useState(true);
  const { openModal } = useGlobalContext();

  const { avatar, introduction, bio, skills } = userDetails || {};

  // Duplicate skills for smooth infinite scroll
  const scrollSkills = [...skills, ...skills, ...skills, ...skills, ...skills];

  return (
    <TooltipProvider>
      <section className="flex flex-col items-center py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Avatar className="relative mb-6 h-24 w-24 rounded-[24px]">
                <div className="relative h-full w-full">
                  <AnimatePresence mode="wait">
                    {!isLoaded && (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-secondary/50 absolute inset-0 animate-pulse rounded-2xl"
                      />
                    )}
                  </AnimatePresence>
                  <motion.img
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isLoaded ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                    src={getUserAvatarImage(userDetails)}
                    alt="Profile"
                    className={cn(
                      "h-full w-full rounded-3xl object-cover",
                      !avatar ? "bg-[#FFB088]" : ""
                    )}
                    loading="eager"
                    decoding="async"
                    onLoad={() => setIsLoaded(true)}
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                    }}
                  />
                </div>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              sideOffset={8}
              avoidCollisions={true}
              className="bg-tooltip-bg-color text-tooltip-text-color flex items-center gap-2 rounded-xl border-0 px-4 py-2 shadow-xl"
            >
              <span className="text-scaled-14 font-medium">Happy to have you here</span>
              <img
                src="/assets/png/handshake.png"
                alt="Handshake"
                className="h-5 w-5 object-contain"
              />
            </TooltipContent>
          </Tooltip>
        </motion.div>

        <motion.div
          className="lg:row relative mb-4 flex flex-col justify-center gap-3 lg:items-start"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h1 className="text-scaled-36 font-bold">{introduction} </h1>
          {edit && (
            <div className="lg:absolute lg:right-[-54px]">
              <Button
                onClick={() => openModal("onboarding")}
                customClass="!p-[13.38px] !shrink-0"
                type={"secondary"}
                icon={<EditIcon className="text-df-icon-color cursor-pointer" />}
              />
            </div>
          )}
        </motion.div>

        <motion.p
          className="mb-8 max-w-xl text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {bio}
        </motion.p>

        {/* Skills Infinite Scroll */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="before:from-background after:from-background relative w-full overflow-hidden py-4 before:absolute before:top-0 before:left-0 before:z-10 before:h-full before:w-20 before:bg-linear-to-r before:to-transparent after:absolute after:top-0 after:right-0 after:z-10 after:h-full after:w-20 after:bg-linear-to-l after:to-transparent"
        >
          <motion.div
            className="flex gap-4 whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 20,
                ease: "linear",
              },
            }}
          >
            {scrollSkills.map((skill, index) => (
              <motion.span key={index} className="bg-card text-scaled-14 rounded-full px-4 py-2">
                {skill?.label}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </section>
    </TooltipProvider>
  );
};
