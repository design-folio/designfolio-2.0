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
            <div
                className="fixed top-0 left-0 right-0 z-[999999] isolate transition-all duration-700 pt-3 px-4 pointer-events-none [transform:translateZ(0)]"
            >
                <nav
                    className="w-full mx-auto transition-all duration-700 ease-in-out border border-border backdrop-blur-md rounded-full shadow-sm max-w-[640px] bg-white/80 dark:bg-[#1a1a1a]/80 pointer-events-auto"
                    style={{ background: "linear-gradient(180deg, #fff6 10%, #fffc)" }}
                >
                    <div className="transition-all duration-700 ease-in-out px-4 sm:px-6">
                        <div className={`flex items-center justify-between transition-all duration-700 ease-in-out ${isScrolled ? "h-14 sm:h-16" : "h-14 sm:h-16"
                            }`}
                        >
                            <Link href="/" data-testid="logo-icon">
                                <Logo className="text-df-icon-color" />
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
                                            icon={
                                                <MemoPower />
                                            }
                                        />
                                    </Link>
                                ) : (
                                    <div className="flex items-center gap-2 sm:gap-4">
                                        <Link href="/login" className="text-sm sm:text-[15px] text-foreground hover-elevate px-2 sm:px-3 py-2 rounded-md cursor-pointer" data-testid="link-login">
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
                                <img
                                    src="/assets/svgs/power.svg"
                                    alt="launch builder"
                                    className="cursor-pointer"
                                />
                            }
                        />
                    </Link>
                ) : (
                    <div className="flex flex-col gap-4 w-full">
                        <Link href="/login" className="" data-testid="link-login">
                            <Button
                                type="secondary"
                                customClass="w-full rounded-full font-medium border-border hover:boder-border" text="Login" />
                        </Link>
                        <Link href={"/claim-link"}>
                            <Button
                                customClass="w-full bg-foreground-landing text-background-landing border border-foreground rounded-full font-medium hover:bg-foreground-landing/80 transition-colors" text=" It's Free → Try now!" />
                        </Link>
                    </div>
                )
                }
            </TempPopoverForLanding>
        </header>
    );
}