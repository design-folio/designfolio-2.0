import { useGlobalContext } from "@/context/globalContext";
import { motion, useAnimation } from "motion/react";
import React, { useEffect, useMemo, useRef } from "react";
import Button from "./button";
import DfImage from "./image";
import EditIcon from "../../public/assets/svgs/edit.svg";
import Link from "next/link";
import Text from "./text";
import LeftArrow from "../../public/assets/svgs/left-arrow.svg";
import { cn } from "@/lib/utils";

export default function Profile({ preview = false, edit = false, userDetails = null, openModal }) {
  const controls = useAnimation();
  const skillsRef = useRef(null);
  const skills = useMemo(
    () =>
      userDetails?.skills?.length != 0 ? userDetails?.skills?.map((skill) => skill.label) : [],
    [userDetails?.skills]
  );

  useEffect(() => {
    // Assuming each skill element and its margin take up 100px for simplicity
    const skillElementWidthIncludingMargin = 100;
    // Adjust the totalWidth calculation based on the actual elements
    const totalWidth = userDetails?.skills?.length * skillElementWidthIncludingMargin * 3; // *3 for the duplicated list

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
      className={cn(
        "bg-df-section-card-bg-color shadow-df-section-card-shadow rounded-[24px] p-4 break-words lg:p-[32px]"
      )}
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
      <div className="flex flex-col items-start gap-[16px] lg:flex-row lg:gap-[32px]">
        <DfImage
          src={userDetails?.avatar?.url ? userDetails?.avatar?.url : "/assets/svgs/avatar.svg"}
          className={"h-[136px] w-[136px] rounded-[24px] lg:h-[142px] lg:w-[142px]"}
        />

        <div className="webkit-fill relative min-w-0 flex-1">
          <div className="flex justify-between gap-4">
            <Text
              as="h1"
              size="h3"
              className="text-df-heading-color webkit-fil min-w-0 font-medium"
            >
              {userDetails?.introduction}
            </Text>
            {edit && (
              <div>
                <Button
                  onClick={() => openModal("onboarding")}
                  customClass="!p-[13.38px] !shrink-0"
                  type={"secondary"}
                  icon={<EditIcon className="text-df-icon-color cursor-pointer" />}
                />
              </div>
            )}
          </div>
          <Text size="p-xsmall" className="webkit-fill text-df-description-color mt-[12px] min-w-0">
            {userDetails?.bio ? userDetails?.bio : "Write your Intro here.."}
          </Text>
        </div>
      </div>
      <div
        className="relative mt-7 overflow-hidden"
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
                <img src="/assets/svgs/scroll-star.svg" className="mr-2" alt="" />
                <Text
                  size="p-xxsmall"
                  className="text-profile-card-skill-color mr-2 cursor-default px-[10px]"
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
