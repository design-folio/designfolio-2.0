import React from "react";
import { motion } from "framer-motion";
import Button from "./button";
import Link from "next/link";
import ClaimDomain from "./claimDomain";

const textVariants = {
  initial: {
    opacity: 0,
    transform: "translateY(100%) rotate(0deg) rotateX(-45deg) translateZ(0px)",
  },
  animate: {
    opacity: 1,
    transform: "translateY(0%) rotate(0deg) rotateX(0deg) translateZ(0px)",
    transition: {
      duration: 0.4, // Duration of the animation
      ease: "easeInOut", // Easing function
    },
  },
};

const containerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.03, // Adjust the delay between animations of children
    },
  },
};

const leftBannerVariants = {
  hidden: {
    x: -50, // Start from left
    scale: 0.8, // Start smaller
    opacity: 0,
  },
  visible: {
    x: 0,
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.5, // Duration of the animation
      ease: "easeInOut", // Easing function
    },
  },
};

const rightBannerVariants = {
  hidden: {
    x: 50, // Start from right
    scale: 0.8, // Start smaller
    opacity: 0,
  },
  visible: {
    x: 0,
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.5, // Duration of the animation
      ease: "easeInOut", // Easing function
    },
  },
};

export default function HeroBanner({ dfToken }) {
  return (
    <div className="relative md:max-w-[680px] xl:max-w-[814px] m-auto">
      <motion.h1
        className="font-satoshi text-[32px] px-4 md:px-[24px] leading-[120%] md:text-[62px] xl:leading-[73px] font-[700] text-landing-heading-text-color md:text-center overflow-hidden"
        style={{ perspective: "600px" }}
        initial="initial"
        animate="animate"
        variants={containerVariants}
      >
        <motion.span className="inline-block" variants={textVariants}>
          Launch
        </motion.span>{" "}
        <motion.span className="inline-block" variants={textVariants}>
          your
        </motion.span>{" "}
        <motion.span className="inline-block" variants={textVariants}>
          portfolio
        </motion.span>{" "}
        <br />
        <motion.span className="inline-block" variants={textVariants}>
          website
        </motion.span>{" "}
        <motion.span className="inline-block" variants={textVariants}>
          superfast
        </motion.span>{" "}
      </motion.h1>

      <motion.p
        className="font-inter text-[20px] px-4 md:px-[24px] text-landing-description-text-color font-[500] md:text-center mt-6"
        style={{ perspective: "600px" }}
        initial="initial"
        animate="animate"
        variants={textVariants}
      >
        5894+ portfolios launched on Designfolio last month.
      </motion.p>
      <motion.img
        src="/assets/svgs/left-banner.svg"
        alt=""
        className="hidden md:block absolute md:top-[15px] xl:top-[75px] md:left-[-330px] transition-transform duration-500 ease-out"
        variants={leftBannerVariants}
        initial="hidden"
        animate="visible"
      />
      <motion.img
        src="/assets/svgs/right-banner.svg"
        alt=""
        className="hidden md:block absolute md:top-[15px] xl:top-[85px] md:right-[-330px] transition-transform duration-500 ease-out"
        variants={rightBannerVariants}
        initial="hidden"
        animate="visible"
      />
      <div className="overflow-hidden">
        <motion.div
          className="mt-10 px-4 text-center"
          style={{ perspective: "600px" }}
          initial="initial"
          animate="animate"
          variants={textVariants}
        >
          {dfToken ? (
            <Link href={"builder"}>
              <Button
                text="Launch Builder"
                customClass="w-full md:w-fit"
                icon={
                  <img
                    src="/assets/svgs/power.svg"
                    alt="launch builder"
                    className="cursor-pointer"
                  />
                }
              />
            </Link>
          ) : (
            <ClaimDomain form="header" />
          )}
        </motion.div>
      </div>
    </div>
  );
}
