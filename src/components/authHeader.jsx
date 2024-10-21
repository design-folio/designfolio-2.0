import React, { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "../../public/assets/svgs/logo.svg";
import { useRouter } from "next/router";

export default function AuthHeader() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const router = useRouter();
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

  const handleNavigation = () => {
    Cookies.remove("df-token", {
      domain: process.env.NEXT_PUBLIC_BASE_DOMAIN,
    });
    router.replace("/");
  };

  const headerStyle = isVisible
    ? "fixed top-0 left-0 right-0 lg:px-10 xl:px-0 z-10 transition-transform duration-300 ease-out"
    : "fixed top-0 left-0 right-0 lg:px-10 xl:px-0 z-10 transform translate-y-[-100%] transition-transform duration-300 ease-out";
  return (
    <div
      className={`flex bg-landing-bg-color justify-center fixed right-0 left-0 p-3 md:px-0 md:py-3 ${headerStyle}`}
    >
      <div onClick={handleNavigation}>
        <Logo className="text-logo-text-color" />
      </div>
    </div>
  );
}
