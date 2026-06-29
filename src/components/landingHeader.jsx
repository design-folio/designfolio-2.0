import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Button from "./button";
import Logo from "../../public/assets/svgs/logo.svg";
import { popovers } from "@/lib/constant";
import { useGlobalContext } from "@/context/globalContext";
import { TempPopoverForLanding } from "./popover";
import MemoPower from "./icons/Power";
import MobileMenuButton from "./MobileMenuButton";
import MemoDFLogo from "./icons/DFLogo";
import MemoDesignfolioLogoV2 from "./icons/DesignfolioLogoV2";

export default function LandingHeader({ dfToken }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const { popoverMenu, setPopoverMenu } = useGlobalContext();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header>
      {/* isolate + translateZ(0) force a compositing layer so Safari keeps header above overscroll/bounce */}
      <div className="pointer-events-none fixed top-0 right-0 left-0 isolate z-[999999] [transform:translateZ(0)] px-4 pt-3 transition-all duration-700">
        <nav
          className="border-border pointer-events-auto mx-auto w-full max-w-[640px] rounded-full border bg-white/80 shadow-sm backdrop-blur-md transition-all duration-700 ease-in-out dark:bg-[#1a1a1a]/80"
          style={{ background: "linear-gradient(180deg, #fff6 10%, #fffc)" }}
        >
          <div className="px-4 transition-all duration-700 ease-in-out sm:px-6">
            <div
              className={`flex items-center justify-between transition-all duration-700 ease-in-out ${
                isScrolled ? "h-14 sm:h-16" : "h-14 sm:h-16"
              }`}
            >
              <Link href="/" data-testid="logo-icon">
                <MemoDesignfolioLogoV2 className="text-df-icon-color w-auto cursor-pointer" />
              </Link>

              {/* {router.pathname === "/" && (
                                <div className="hidden md:flex items-center gap-8">
                                    <a href="#howitworks" className="text-sm sm:text-[15px] text-foreground hover-elevate px-3 py-2 rounded-md cursor-pointer" data-testid="link-howitworks">
                                        How it works?
                                    </a>
                                    <a href="#otheraitools" className="text-sm sm:text-[15px] text-foreground hover-elevate px-3 py-2 rounded-md cursor-pointer " data-testid="link-otheraitools">
                                        Build with AI
                                    </a>
                                </div>
                            )} */}

              <div className="hidden md:block">
                {dfToken ? (
                  <Link href="/builder">
                    <Button
                      text="Launch Builder"
                      customClass="bg-foreground-landing text-background-landing border border-foreground rounded-full py-2 px-3 sm:px-4 md:px-6 text-xs sm:text-sm md:text-base font-medium hover:bg-foreground-landing/80 transition-colors"
                      icon={<MemoPower />}
                    />
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 sm:gap-4">
                    <Link
                      href="/login"
                      className="text-foreground hover-elevate cursor-pointer rounded-md px-2 py-2 text-sm sm:px-3 sm:text-[15px]"
                      data-testid="link-login"
                    >
                      Login
                    </Link>
                    <Link href="/claim-link">
                      <Button
                        size="medium"
                        text=" It's Free → Try now!"
                        customClass="bg-foreground-landing text-background-landing border border-foreground rounded-full py-2 px-3 sm:px-4 md:px-6 text-xs sm:text-sm md:text-base font-medium hover:bg-foreground-landing/80 transition-colors"
                        data-testid="button-getstarted"
                      />
                    </Link>
                  </div>
                )}
              </div>

              <MobileMenuButton
                isOpen={popovers.landingMenu === popoverMenu}
                onToggle={() =>
                  setPopoverMenu((prev) =>
                    prev === popovers.landingMenu ? null : popovers.landingMenu
                  )
                }
              />
            </div>
          </div>
        </nav>
      </div>
      <TempPopoverForLanding show={popovers.landingMenu === popoverMenu}>
        {dfToken ? (
          <Link href="/builder">
            <Button
              text="Launch Builder"
              icon={
                <img src="/assets/svgs/power.svg" alt="launch builder" className="cursor-pointer" />
              }
            />
          </Link>
        ) : (
          <div className="flex w-full flex-col gap-4">
            <Link href="/login" className="" data-testid="link-login">
              <Button
                type="secondary"
                customClass="w-full rounded-full font-medium border-border hover:boder-border"
                text="Login"
              />
            </Link>
            <Link href={"/claim-link"}>
              <Button
                customClass="w-full bg-foreground-landing text-background-landing border border-foreground rounded-full font-medium hover:bg-foreground-landing/80 transition-colors"
                text=" It's Free → Try now!"
              />
            </Link>
          </div>
        )}
      </TempPopoverForLanding>
    </header>
  );
}
