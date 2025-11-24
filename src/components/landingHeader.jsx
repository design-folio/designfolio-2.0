import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Button from "./button";
import Logo from "../../public/assets/svgs/logo.svg";
import MenuIcon from "../../public/assets/svgs/menu-tabular.svg";
import CloseIcon from "../../public/assets/svgs/close-tabular.svg";
import { popovers } from "@/lib/constant";
import { useGlobalContext } from "@/context/globalContext";
import { TempPopoverForLanding } from "./popover";

export default function LandingHeader({ dfToken }) {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const router = useRouter();
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


    return (
        <header>
            <nav className={`fixed top-0 left-0 right-0 z-[9999] border-b border-border bg-background-landing transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'
                }`}>
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        <Link href="/" data-testid="logo-icon">
                            <Logo className="text-df-icon-color" />
                        </Link>

                        {router.pathname === "/" && (
                            <div className="hidden md:flex items-center gap-8">
                                <a href="#howitworks" className="text-sm sm:text-[15px] text-foreground hover-elevate px-3 py-2 rounded-md cursor-pointer" data-testid="link-howitworks">
                                    How it works?
                                </a>
                                <a href="#otheraitools" className="text-sm sm:text-[15px] text-foreground hover-elevate px-3 py-2 rounded-md cursor-pointer " data-testid="link-otheraitools">
                                    Build with AI
                                </a>
                            </div>
                        )}

                        <div className="hidden md:block">
                            {dfToken ? (
                                <Link href="/builder">
                                    <Button
                                        text="Launch Builder"
                                        customClass="bg-foreground-landing text-background-landing border border-foreground rounded-full py-2 px-3 sm:px-4 md:px-6 text-xs sm:text-sm md:text-base font-medium hover:bg-foreground-landing/80 transition-colors"
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

                        <Button
                            size="medium"
                            customClass="md:hidden border-border hover:boder-border"
                            type="secondary"
                            icon={
                                <div className="relative w-4 h-4 flex items-center justify-center">
                                    <MenuIcon
                                        className={`absolute transition-all duration-300 ease-in-out cursor-pointer ${popovers.landingMenu === popoverMenu
                                            ? "opacity-0 scale-75"
                                            : "opacity-100 scale-100"
                                            }`}
                                    />
                                    <CloseIcon
                                        className={`absolute transition-all duration-300 ease-in-out cursor-pointer ${popovers.landingMenu === popoverMenu
                                            ? "opacity-100 scale-100"
                                            : "opacity-0 scale-75"
                                            }`}
                                    />
                                </div>
                            }
                            onClick={() =>
                                setPopoverMenu((prev) =>
                                    prev == popovers.landingMenu ? null : popovers.landingMenu
                                )
                            }
                        />


                    </div>
                </div>
            </nav>
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
            </TempPopoverForLanding >
        </header >
    );
}