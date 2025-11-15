import { Avatar } from "@/components/ui/avatar";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../button";
import { EditIcon } from "lucide-react";
import { useGlobalContext } from "@/context/globalContext";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import { cn } from "@/lib/utils";

export const Hero = ({ userDetails, edit }) => {
  const [isLoaded, setIsLoaded] = useState(true);
  const { openModal } = useGlobalContext();

  const { avatar, introduction, bio, skills } = userDetails || {};

  // Duplicate skills for smooth infinite scroll
  const scrollSkills = [...skills, ...skills, ...skills, ...skills, ...skills];

  return (
    <section className="flex flex-col items-center text-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Avatar className="w-24 h-24 mb-6 relative rounded-full">
          <div className="relative w-full h-full ">
            <AnimatePresence mode="wait">
              {!isLoaded && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-secondary/50 animate-pulse rounded-2xl"
                />
              )}
            </AnimatePresence>
            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: isLoaded ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              src={getUserAvatarImage(userDetails)}
              alt="Profile"
              className={cn("rounded-full w-full h-full object-cover", !avatar ? "bg-[#FFB088]" : "")}
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
      </motion.div>

      <motion.div
        className="mb-4 flex flex-col lg:row justify-center lg:items-start gap-3 relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h1 className="text-4xl font-bold">{introduction} </h1>
        {edit && (
          <div className="lg:absolute lg:right-[-54px]">
            <Button
              onClick={() => openModal("onboarding")}
              customClass="!p-[13.38px] !flex-shrink-0"
              type={"secondary"}
              icon={<EditIcon className="text-df-icon-color cursor-pointer" />}
            />
          </div>
        )}
      </motion.div>

      <motion.p
        className="dark:text-gray-400 text-gray-600 max-w-xl mb-8"
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
        className="w-full overflow-hidden relative py-4 before:absolute before:left-0 before:top-0 before:z-10 before:w-20 before:h-full before:bg-gradient-to-r before:from-background before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:w-20 after:h-full after:bg-gradient-to-l after:from-background after:to-transparent"
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
            <motion.span
              key={index}
              className="bg-card px-4 py-2 rounded-full text-sm"
            >
              {skill?.label}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};
