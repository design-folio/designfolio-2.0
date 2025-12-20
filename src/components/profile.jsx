/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/buttonNew";
import DfImage from "./image";
import Link from "next/link";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import { capitalizeWords } from "@/lib/capitalizeText";
import { PencilIcon, Sparkle } from "lucide-react";
import MemoLeftArrow from "./icons/LeftArrow";
import { cn } from "@/lib/utils";

export default function Profile({
  preview = false,
  edit = false,
  userDetails = null,
  openModal,
}) {
  const controls = useAnimation();
  const skillsRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const skills = useMemo(
    () =>
      userDetails?.skills?.length
        ? userDetails.skills.map((skill) => skill.label)
        : [],
    [userDetails?.skills]
  );

  useEffect(() => {
    // Assuming each skill element and its margin take up 100px for simplicity
    const skillElementWidthIncludingMargin = 100;
    // Adjust the totalWidth calculation based on the actual elements
    const totalWidth =
      (userDetails?.skills?.length || 0) * skillElementWidthIncludingMargin * 3; // *3 for the duplicated list

    controls.start({
      x: [0, -totalWidth],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: totalWidth / 30, // Adjust for desired speed
          ease: "linear",
        },
      },
    });
  }, [controls, userDetails?.skills]);

  return (
    <motion.div
      initial={{ y: 20 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <Card
        className={cn("bg-df-section-card-bg-color backdrop-blur-sm border-0 rounded-[24px] overflow-hidden relative")}
        style={{
          boxShadow:
            "0 0 0 1px rgba(0,0,0,0.03), 0 0 40px rgba(0,0,0,0.015)",
        }}
      >
        {/* Preview Mode */}
        {preview && (
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
              className="h-11 w-11"
              onClick={() => openModal("onboarding")}
            >
              <PencilIcon className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Profile Info */}
        <div className="p-4 lg:p-8 pb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Avatar Container */}
            <div
              className={cn("w-28 h-28 md:w-36 md:h-36 rounded-3xl flex items-center justify-center relative overflow-hidden", !userDetails?.avatar ? "bg-[#FFB088]" : "")}
              data-testid="avatar-profile"
            >
              <DfImage
                src={getUserAvatarImage(userDetails)}
                onLoad={() => setImageLoaded(true)}
                className={
                  "w-full h-full object-cover"
                }
              />
            </div>

            {/* Text Section */}
            <div className="flex-1">
              <h1
                className="text-3xl md:text-4xl font-semibold mb-2 font-gsans text-profile-card-heading-color break-words"
                data-testid="text-user-name"
              >
                {userDetails?.introduction || `Hey, I'm ${capitalizeWords(userDetails?.firstName) || ""}`}
              </h1>
              <p
                className="text-base text-profile-card-description-color break-words"
                data-testid="text-user-role"
              >
                {userDetails?.bio || "Write your intro here..."}
              </p>
            </div>
          </div>
        </div>



        {/* Skills Banner Strip */}
        {skills?.length > 0 && (
          <div
            className="relative overflow-hidden border-t border-border/20 py-4"
            style={{
              background: "var(--skills-banner-bg)",
              boxShadow: "var(--skills-banner-shadow)",
              maskImage:
                "linear-gradient(to right, rgba(0,0,0,0) 0%, rgb(0,0,0) 12.5%, rgb(0,0,0) 87.5%, rgba(0,0,0,0) 100%)",
            }}
          >
            <motion.div
              ref={skillsRef}
              animate={controls}
              initial={{ x: 0 }}
              className="flex px-8 whitespace-nowrap"
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
                  <span className="text-sm text-foreground-landing/50 whitespace-nowrap">
                    {skill}
                  </span>
                  <Sparkle className="w-3 h-3 text-foreground-landing/30 fill-foreground-landing/30" />
                </div>
              ))}
            </motion.div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
