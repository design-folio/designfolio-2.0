import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Button from "./button";
import HamburgerIcon from "../../public/assets/svgs/hamburger.svg";
import { popovers } from "@/lib/constant";
import { useGlobalContext } from "@/context/globalContext";
import Popover from "./popover";
import Logo from "../../public/assets/svgs/logo.svg";

export default function LandingHeader({ dfToken }) {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY < 10) {
                setIsVisible(true);
            } else if (currentScrollY > lastScrollY) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[9999] border-b border-border bg-background-landing transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'
            }`}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16 sm:h-20">
                    <Link href="/" data-testid="logo-icon">
                        <Logo className="text-df-icon-color" />
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#howitworks" className="text-sm sm:text-[15px] text-foreground hover-elevate px-3 py-2 rounded-md cursor-pointer" data-testid="link-howitworks">
                            How it works?
                        </a>
                        <a href="#otheraitools" className="text-sm sm:text-[15px] text-foreground hover-elevate px-3 py-2 rounded-md cursor-pointer " data-testid="link-otheraitools">
                            Build with AI
                        </a>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link href="/login" className="text-sm sm:text-[15px] text-foreground hover-elevate px-2 sm:px-3 py-2 rounded-md cursor-pointer" data-testid="link-login">
                            Login
                        </Link>
                        <Link href="/signup">
                            <Button
                                size="medium"
                                text=" It's Free → Try now!"
                                customClass="bg-foreground-landing text-background-landing border border-foreground rounded-full py-2 px-3 sm:px-4 md:px-6 text-xs sm:text-sm md:text-base font-medium hover:bg-foreground-landing/80 transition-colors"
                                data-testid="button-getstarted"
                            >

                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}