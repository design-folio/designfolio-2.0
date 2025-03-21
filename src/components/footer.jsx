import React, { useRef } from "react";
import ClaimDomain from "./claimDomain";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import Button from "./button";

export default function Footer({ dfToken, innerClass = "", className = "" }) {
  const ref = useRef(null);
  const refLink = useRef(null);
  const isInView = useInView(ref, { once: true });
  const isInLinkView = useInView(refLink, { once: true });

  return (
    <>
      <motion.div
        ref={ref}
        className={`mt-[75px] w-full xl:mt-[120px] px-[16px] lg:px-0 md:max-w-[1192px] mx-auto ${className}`}
        initial={{ opacity: 0, translateY: 80 }} // Initial state
        animate={{ opacity: isInView ? 1 : 0, translateY: isInView ? 0 : 80 }} // Animated state
        transition={{ duration: 0.5, ease: [0.17, 0.55, 0.55, 1] }} // Smooth transition
      >
        <div
          className={`bg-landing-card-bg-color border-[6px] border-solid border-landing-card-border-color py-10 xl:p-0 xl:h-[500px] rounded-[24px] flex flex-col justify-center items-center px-4 md:px-0 ${innerClass}`}
        >
          <p className="text-center text-landing-footer-heading-color md:hidden px-[40px] text-[22px] xl:text-[39.5px] font-satoshi font-[500] xl:leading-[46.87px]">
            Build your portfolio website now – it&lsquo;s simpler than you
            think!
          </p>
          <p className="text-center hidden text-landing-footer-heading-color md:block px-[40px] text-[22px] xl:text-[39.5px] font-satoshi font-[500] xl:leading-[46.87px]">
            <b>
              Your dream port<i>folio</i> is, not days, not{" "}
            </b>
            <br /> <b>hours but minutes away</b> – Start now!
          </p>
          <div className="my-10 w-auto">
            {dfToken ? (
              <Link href={"builder"}>
                <Button
                  text="Launch Builder"
                  customClass="w-full md:w-fit m-auto"
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
              <ClaimDomain />
            )}
          </div>
        </div>
      </motion.div>

      <motion.div
        ref={refLink}
        className="flex flex-col lg:flex-row justify-center items-center gap-5 lg:px-10 lg:justify-between max-w-[1192px] mx-auto pt-20 pb-5"
        initial={{ opacity: 0, translateY: 80 }} // Initial state
        animate={{
          opacity: isInLinkView ? 1 : 0,
          translateY: isInLinkView ? 0 : 80,
        }} // Animated state
        transition={{ duration: 0.5, ease: [0.17, 0.55, 0.55, 1] }} // Smooth transition
      >
        <p className="text-[14px] font-[500] text-landing-footer-link-color font-inter">
          Copyright © {new Date().getFullYear()} Designfolio
        </p>
        <div className="flex gap-10">
          <Link href={"/privacy-policy"}>
            <p className="text-[14px] font-[500] text-landing-footer-link-color font-inter">
              Privacy Policy
            </p>
          </Link>
          <Link href={"terms-and-conditions"}>
            <p className="text-[14px] font-[500] text-landing-footer-link-color font-inter">
              Terms & Conditions
            </p>
          </Link>
        </div>
      </motion.div>
    </>
  );
}
