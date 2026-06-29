import React from "react";
import { motion } from "motion/react";
import Button from "./button";
import Link from "next/link";
import ClaimDomain from "./claimDomain-old";

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
    <div className="relative m-auto md:max-w-[680px] xl:max-w-[814px]">
      <motion.h1
        className="font-satoshi text-landing-heading-text-color overflow-hidden px-4 text-[32px] leading-[120%] font-[700] md:px-[24px] md:text-center md:text-[62px] xl:leading-[73px]"
        style={{ perspective: "600px" }}
        initial="initial"
        animate="animate"
        variants={containerVariants}
      >
        <motion.span className="inline-block" variants={textVariants}>
          Build
        </motion.span>{" "}
        <motion.span className="inline-block" variants={textVariants}>
          a
        </motion.span>{" "}
        <motion.span className="inline-block" variants={textVariants}>
          brag<span className="italic">worthy</span>
        </motion.span>{" "}
        <br />
        <motion.span className="inline-block" variants={textVariants}>
          portfolio
        </motion.span>{" "}
        <motion.span className="inline-block" variants={textVariants}>
          website
        </motion.span>{" "}
      </motion.h1>

      <motion.p
        className="font-inter text-landing-description-text-color mt-6 px-4 text-[20px] font-[500] md:px-[24px] md:text-center"
        style={{ perspective: "600px" }}
        initial="initial"
        animate="animate"
        variants={textVariants}
      >
        Built for Designers, Product Managers, & Developers
      </motion.p>
      <motion.img
        src="/assets/svgs/left-banner.svg"
        alt=""
        className="absolute hidden transition-transform duration-500 ease-out md:top-[15px] md:left-[-330px] md:block xl:top-[75px]"
        variants={leftBannerVariants}
        initial="hidden"
        animate="visible"
      />
      <motion.img
        src="/assets/svgs/right-banner.svg"
        alt=""
        className="absolute hidden transition-transform duration-500 ease-out md:top-[15px] md:right-[-330px] md:block xl:top-[85px]"
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
