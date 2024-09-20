import React, { useRef } from "react";
import ClaimDomain from "./claimDomain";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useInView } from "framer-motion";
import Link from "next/link";
import Button from "./button";

export default function Footer({ dfToken }) {
  const router = useRouter();
  const token = Cookies.get("token");
  const ref = useRef(null);
  const refLink = useRef(null);
  const isInView = useInView(ref, { once: true });
  const isInLinkView = useInView(refLink, { once: true });

  return (
    <>
      <div
        ref={ref}
        className="mt-[66px] w-full xl:mt-[120px] px-[16px] lg:px-0 md:max-w-[1192px] mx-auto"
        style={{
          opacity: isInView ? 1 : 0,
          transform: isInView ? "none" : "translateY(80px)",
          transition: `all 0.5s cubic-bezier(0.17, 0.55, 0.55, 1) 0.5s`,
        }}
      >
        <div className="bg-landing-card-background border-[6px] border-solid border-landing-card-border py-10 xl:p-0 xl:h-[500px] rounded-[24px] flex flex-col justify-center items-center px-4 md:px-0">
          <p className="text-center text-heading-text md:hidden px-[40px] text-[22px] xl:text-[39.5px] font-satoshi font-[500] xl:leading-[46.87px]">
            Build your portfolio website now – it&lsquo;s simpler than you
            think!
          </p>
          <p className="text-center hidden text-df-primary-200 md:block px-[40px] text-[22px] xl:text-[39.5px] font-satoshi font-[500] xl:leading-[46.87px]">
            Build your portfolio website now
            <br />– it&lsquo;s simpler than you think!
          </p>
          <div className="my-10 w-full">
            {dfToken ? (
              <Link href={"builder"}>
                <Button
                  text="Launch Builder"
                  type="tertiary"
                  customClass="w-full md:w-fit"
                  icon={
                    <img src="/assets/svgs/power.svg" alt="launch builder" />
                  }
                />
              </Link>
            ) : (
              <ClaimDomain />
            )}
          </div>
        </div>
      </div>
      <div
        ref={refLink}
        style={{
          opacity: isInLinkView ? 1 : 0,
          transform: isInLinkView ? "none" : "translateY(80px)",
          transition: `all 0.5s cubic-bezier(0.17, 0.55, 0.55, 1) 0.5s`,
        }}
        className="flex flex-col lg:flex-row justify-center items-center gap-5 lg:px-10 lg:justify-between  max-w-[1192px] mx-auto pt-20 pb-5 transition-all duration-500 ease-out"
      >
        <p className="text-[14px] font-[500] text-description-text font-inter">
          Copyright © 2023 Designfolio
        </p>
        <div className="flex gap-10">
          <Link href={"/privacy-policy"}>
            <p className="text-[14px] font-[500] text-description-text font-inter">
              Privacy Policy
            </p>
          </Link>
          <Link href={"terms-and-conditions"}>
            <p className="text-[14px] font-[500] text-description-text font-inter">
              Terms & Conditions
            </p>
          </Link>
        </div>
      </div>
    </>
  );
}
