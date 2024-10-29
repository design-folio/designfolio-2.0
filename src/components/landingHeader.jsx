import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Button from "./button";
import HamburgerIcon from "../../public/assets/svgs/hamburger.svg";
import { popovers } from "@/lib/constant";
import { useGlobalContext } from "@/context/globalContext";
import Popover from "./popover";
import Logo from "../../public/assets/svgs/logo.svg";

const textVariants = {
  initial: {
    opacity: 0,
    transform: "translateY(-100%) rotate(0deg) rotateX(-45deg) translateZ(0px)",
  },
  animate: {
    opacity: 1,
    transform: "translateY(0%) rotate(0deg) rotateX(0deg) translateZ(0px)",
    transition: {
      duration: 0.5, // Duration of the animation
      ease: "easeInOut", // Easing function
    },
  },
};

export default function LandingHeader({ dfToken }) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { popoverMenu, setPopoverMenu } = useGlobalContext();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Header is visible if scrolling down or at the top of the page
      if (currentScrollY < lastScrollY || currentScrollY <= 0) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const smoothScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 120,
        behavior: "smooth",
      });
    }
  };

  const headerStyle = isVisible
    ? "fixed top-0 left-0 right-0 lg:px-10 xl:px-0 z-10 transition-transform duration-300 ease-out"
    : "fixed top-0 left-0 right-0 lg:px-10 xl:px-0 z-10 transform translate-y-[-100%] transition-transform duration-300 ease-out border-b borderb-solid border-landng-header-border-color";

  const commonTextClass =
    "text-landing-nav-link-color hover:text-landing-nav-link-hover-color py-[0.5px] hover:py-1 px-[8px] rounded-[5px] font-sfpro  text-[16px] font-[500] cursor-pointer hover:bg-landing-nav-link-bg-hover-color transition-all duration-[350ms] ease-in-out";

  return (
    <motion.header
      className={`${headerStyle} bg-landing-bg-color`}
      initial="initial"
      animate="animate"
      variants={textVariants}
    >
      <div className="flex relative justify-between max-w-[1192px] p-3 md:px-0 md:py-3 mx-auto items-center ">
        <nav className=" md:flex gap-7 items-center md:pl-3 lg:pl-0">
          <Logo className="text-df-icon-color" />

          <span className="text-landing-nav-link-base-color text-2xl hidden md:block">
            /
          </span>
          <ul className=" gap-6 list-none items-center p-0 hidden md:flex">
            <li className={commonTextClass}>
              <Link
                href={"#how-it-works"}
                onClick={(e) => {
                  e.preventDefault();
                  smoothScroll("how-it-works");
                }}
              >
                How it works?
              </Link>
            </li>
          </ul>
        </nav>
        <div className="hidden md:block">
          {dfToken ? (
            <Link href="/builder">
              <Button
                text="Launch Builder"
                customClass="w-full md:w-fit"
                icon={<img src="/assets/svgs/power.svg" alt="launch builder" />}
              />
            </Link>
          ) : (
            <div className=" hidden lg:flex gap-4">
              <Link href="/login">
                <Button type="secondary" text="Login" />
              </Link>
              <Link href="/claim-link">
                <Button text="Start for free" customClass="w-full md:w-fit" />
              </Link>
            </div>
          )}
        </div>

        <Button
          customClass="md:hidden"
          type="secondary"
          icon={
            <>
              <HamburgerIcon
                className={`mb-[4.67px] transition-transform easeInOut ${
                  popovers.landingMenu === popoverMenu &&
                  "translate-y-3.2 rotate-45"
                }`}
              />
              <HamburgerIcon
                className={`transition-transform easeInOut ${
                  popovers.landingMenu === popoverMenu &&
                  "-rotate-45 -translate-y-3.2"
                }`}
              />
            </>
          }
          onClick={() =>
            setPopoverMenu((prev) =>
              prev == popovers.landingMenu ? null : popovers.landingMenu
            )
          }
        />
      </div>
      <Popover show={popovers.landingMenu === popoverMenu}>
        {dfToken ? (
          <Button customClass="w-full" text="Launch Builder" />
        ) : (
          <>
            <Link href={"/login"}>
              <Button customClass="w-full" text="Login" type="secondary" />
            </Link>
            <Link href={"/claim-link"}>
              <Button customClass="w-full mt-4" text="Start for free" />
            </Link>
          </>
        )}
      </Popover>
    </motion.header>
  );
}
