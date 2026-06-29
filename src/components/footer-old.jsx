import React, { useRef } from "react";
import ClaimDomain from "./claimDomain-old";
import { motion, useInView } from "motion/react";
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
        className={`mx-auto mt-[75px] w-full px-[16px] md:max-w-[1192px] lg:px-0 xl:mt-[120px] ${className}`}
        initial={{ opacity: 0, translateY: 80 }} // Initial state
        animate={{ opacity: isInView ? 1 : 0, translateY: isInView ? 0 : 80 }} // Animated state
        transition={{ duration: 0.5, ease: [0.17, 0.55, 0.55, 1] }} // Smooth transition
      >
        <div
          className={`bg-landing-card-bg-color border-landing-card-border-color flex flex-col items-center justify-center rounded-[24px] border-[6px] border-solid px-4 py-10 md:px-0 xl:h-[500px] xl:p-0 ${innerClass}`}
        >
          <p className="text-landing-footer-heading-color font-satoshi px-[40px] text-center text-[22px] font-[500] md:hidden xl:text-[39.5px] xl:leading-[46.87px]">
            Build your portfolio website now – it&lsquo;s simpler than you think!
          </p>
          <p className="text-landing-footer-heading-color font-satoshi hidden px-[40px] text-center text-[22px] font-[500] md:block xl:text-[39.5px] xl:leading-[46.87px]">
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
        className="mx-auto flex max-w-[1192px] flex-col items-center justify-center gap-5 pt-20 pb-5 lg:flex-row lg:justify-between lg:px-10"
        initial={{ opacity: 0, translateY: 80 }} // Initial state
        animate={{
          opacity: isInLinkView ? 1 : 0,
          translateY: isInLinkView ? 0 : 80,
        }} // Animated state
        transition={{ duration: 0.5, ease: [0.17, 0.55, 0.55, 1] }} // Smooth transition
      >
        <p className="text-landing-footer-link-color font-inter text-[14px] font-[500]">
          Copyright © {new Date().getFullYear()} Designfolio
        </p>
        <div className="flex gap-3 lg:gap-10">
          <Link href={"/privacy-policy"}>
            <p className="text-landing-footer-link-color font-inter cursor-pointer text-[10px] font-[500] lg:text-[14px]">
              Privacy Policy
            </p>
          </Link>
          <Link href={"terms-and-conditions"}>
            <p className="text-landing-footer-link-color font-inter cursor-pointer text-[10px] font-[500] lg:text-[14px]">
              Terms & Conditions
            </p>
          </Link>
          <Link href={"refund-policy"}>
            <p className="text-landing-footer-link-color font-inter cursor-pointer text-[10px] font-[500] lg:text-[14px]">
              Refund Policy
            </p>
          </Link>
        </div>
      </motion.div>
    </>
  );
}
