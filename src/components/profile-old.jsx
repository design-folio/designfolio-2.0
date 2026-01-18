import { useGlobalContext } from "@/context/globalContext";
import { motion, useAnimation } from "framer-motion";
import React, { useEffect, useMemo, useRef } from "react";
import Button from "./button";
import DfImage from "./image";
import EditIcon from "../../public/assets/svgs/edit.svg";
import Link from "next/link";
import Text from "./text";
import LeftArrow from "../../public/assets/svgs/left-arrow.svg";
import { cn } from "@/lib/utils";

export default function Profile({
  preview = false,
  edit = false,
  userDetails = null,
  openModal,
}) {
  const controls = useAnimation();
  const skillsRef = useRef(null);
  const skills = useMemo(
    () =>
      userDetails?.skills?.length != 0
        ? userDetails?.skills?.map((skill) => skill.label)
        : [],
    [userDetails?.skills]
  );

  useEffect(() => {
    // Assuming each skill element and its margin take up 100px for simplicity
    const skillElementWidthIncludingMargin = 100;
    // Adjust the totalWidth calculation based on the actual elements
    const totalWidth =
      userDetails?.skills?.length * skillElementWidthIncludingMargin * 3; // *3 for the duplicated list

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
    <section
      className={cn("bg-df-section-card-bg-color shadow-df-section-card-shadow rounded-[24px] p-4 lg:p-[32px] break-words")}
    >
      {preview && (
        <Link href={"/builder"}>
          <Button
            text="Exit preview"
            customClass="mb-5"
            type="secondary"
            size="small"
            icon={<LeftArrow className="text-df-icon-color cursor-pointer" />}
          />

        </Link>
      )}
      <div className="flex flex-col lg:flex-row gap-[16px] lg:gap-[32px] items-start ">
        <DfImage
          src={
            userDetails?.avatar?.url
              ? userDetails?.avatar?.url
              : "/assets/svgs/avatar.svg"
          }
          className={
            "w-[136px] h-[136px] lg:w-[142px] lg:h-[142px] rounded-[24px]"
          }
        />

        <div className="flex-1 relative min-w-0 webkit-fill">
          <div className="flex justify-between gap-4">
            <Text
              as="h1"
              size="h3"
              className="text-df-heading-color min-w-0 webkit-fil font-medium"
            >
              {userDetails?.introduction}
            </Text>
            {edit && (
              <div>
                <Button
                  onClick={() => openModal("onboarding")}
                  customClass="!p-[13.38px] !flex-shrink-0"
                  type={"secondary"}
                  icon={
                    <EditIcon className="text-df-icon-color cursor-pointer" />
                  }
                />
              </div>
            )}
          </div>
          <Text
            size="p-xsmall"
            className="min-w-0 webkit-fill mt-[12px] text-df-description-color"
          >
            {userDetails?.bio ? userDetails?.bio : "Write your Intro here.."}
          </Text>
        </div>
      </div>
      <div
        className="relative overflow-hidden mt-7"
        style={{
          opacity: 1,
          maskImage:
            "linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 12.5%, rgb(0, 0, 0) 87.5%, rgba(0, 0, 0, 0) 100%)",
        }}
      >
        <motion.div
          ref={skillsRef}
          animate={controls}
          initial={{ x: 0 }}
          className="flex max-w-[300px] lg:max-w-[529px]"
          style={{ whiteSpace: "nowrap" }}
        >
          {userDetails?.skills &&
            [
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
              <React.Fragment key={index}>
                <img
                  src="/assets/svgs/scroll-star.svg"
                  className="mr-2"
                  alt=""
                />
                <Text
                  size="p-xxsmall"
                  className=" text-profile-card-skill-color px-[10px] cursor-default mr-2"
                >
                  {skill}
                </Text>
                {/* <div className="text-[12.8px] md:text-[14px] text-profile-card-skills-text  font-[500] font-inter rounded-[5px] px-[10px] cursor-default mr-2">
                  {skill}
                </div> */}
              </React.Fragment>
            ))}
        </motion.div>
      </div>
    </section>
  );
}
