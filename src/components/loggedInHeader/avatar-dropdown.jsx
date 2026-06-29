import React, { useState, useRef, Suspense, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { Crown, Settings, LogOut } from "lucide-react";
import { useGlobalContext } from "@/context/globalContext";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import { usePostHogEvent } from "@/hooks/usePostHogEvent";
import { POSTHOG_EVENT_NAMES } from "@/lib/posthogEventNames";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import queryClient from "@/network/queryClient";
import { removeCursor } from "@/lib/cursor";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

function useClickAway(ref, handler) {
  React.useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

export function AvatarDropdown({ onClose, variant = "navbar" }) {
  const isSidebar = variant === "sidebar";
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [diamondLottie, setDiamondLottie] = useState(null);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const phEvent = usePostHogEvent();

  const {
    userDetails,
    setUserDetails,
    setShowUpgradeModal,
    setUpgradeModalUnhideProject,
    setShowSettingsModal,
  } = useGlobalContext();

  useEffect(() => {
    fetch("/lottie/diamond-lottie.json")
      .then((res) => res.json())
      .then(setDiamondLottie)
      .catch(() => {});
  }, []);

  useClickAway(dropdownRef, () => setIsOpen(false));

  const close = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleLogout = async () => {
    setUserDetails(null);
    queryClient.removeQueries();
    Cookies.remove("df-token", { domain: process.env.NEXT_PUBLIC_BASE_DOMAIN });
    localStorage.removeItem("bottom_notification_seen");
    removeCursor();
    router.replace("/");
    close();
  };

  const handleSettings = () => {
    setShowSettingsModal(true);
    close();
  };

  const handleUpgrade = () => {
    setUpgradeModalUnhideProject?.(null);
    setShowUpgradeModal(true);
    phEvent(POSTHOG_EVENT_NAMES.UPGRADE_PRO_CLICKED, {
      premium_user: userDetails?.pro,
      user_email: userDetails?.email,
      username: userDetails?.username,
      source: "dropdown",
    });
    close();
  };

  const menuItems = [
    ...(!userDetails?.pro
      ? [
          {
            id: "upgrade",
            label: "Upgrade PRO",
            icon: null,
            action: handleUpgrade,
            isUpgrade: true,
          },
        ]
      : []),
    {
      id: "settings",
      label: "Settings",
      subLabel: "Custom Domains, Username and more",
      icon: Settings,
      action: handleSettings,
    },
    { id: "logout", label: "Logout", icon: LogOut, action: handleLogout },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen((v) => !v)}
          className={`block cursor-pointer transition-all focus:ring-2 focus:ring-black/20 focus:outline-none dark:focus:ring-white/20 ${isSidebar ? "rounded-xl" : "rounded-full"}`}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <div className="relative">
            <Avatar
              className={`shrink-0 border border-black/10 transition-transform hover:scale-105 dark:border-white/10 ${isSidebar ? "h-10 w-10 rounded-xl" : "h-10 w-10"}`}
            >
              <AvatarImage
                src={getUserAvatarImage(userDetails)}
                alt="Profile"
                className="cursor-pointer object-cover"
              />
              <AvatarFallback>{userDetails?.username?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 cursor-pointer rounded-full border border-black/10 bg-white px-1.5 py-0.5 whitespace-nowrap shadow-sm dark:border-white/10 dark:bg-zinc-800">
              <span className="block text-[8px] leading-none font-bold tracking-wider text-black uppercase dark:text-white">
                {userDetails?.pro ? "PRO" : "Free"}
              </span>
            </div>
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="avatar-dropdown"
              initial={isSidebar ? { opacity: 0, x: -4 } : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, x: 0, y: 0, transition: { duration: 0.15, ease: "easeOut" } }}
              exit={{
                opacity: 0,
                ...(isSidebar ? { x: -4 } : { y: -4 }),
                pointerEvents: "none",
                transition: { duration: 0.15, ease: "easeIn" },
              }}
              className={`absolute z-50 min-w-[280px] ${isSidebar ? "bottom-0 left-full ml-3" : "top-full right-0 mt-2"}`}
              onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
              style={{ transformOrigin: isSidebar ? "bottom left" : "top right" }}
            >
              <div className="bg-card w-full overflow-hidden rounded-2xl border border-black/10 p-1.5 shadow-lg dark:border-white/10">
                <div className="relative flex flex-col" onMouseLeave={() => setHoveredId(null)}>
                  {menuItems.map((item) => {
                    const isActive = hoveredId === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onMouseEnter={() => setHoveredId(item.id)}
                        onClick={item.action}
                        className="group relative w-full cursor-pointer text-left focus:outline-none"
                      >
                        {isActive && (
                          <motion.div
                            layoutId="avatar-dropdown-highlight"
                            className="absolute inset-0 z-0 rounded-xl bg-black/5 dark:bg-white/5"
                            initial={false}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                          />
                        )}
                        <div className="relative z-10 flex w-full cursor-pointer items-center rounded-xl px-3 py-3 text-[#1A1A1A] transition-colors duration-150 dark:text-[#F0EDE7]">
                          <div className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center">
                            {item.isUpgrade ? (
                              <Suspense fallback={<Crown className="h-4 w-4 text-[#FF553E]" />}>
                                {diamondLottie ? (
                                  <Lottie
                                    animationData={diamondLottie}
                                    style={{ width: 32, height: 32 }}
                                    loop
                                  />
                                ) : (
                                  <Crown className="h-4 w-4 text-[#FF553E]" />
                                )}
                              </Suspense>
                            ) : Icon ? (
                              <Icon className="h-4 w-4 cursor-pointer" />
                            ) : null}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[13px] leading-none font-medium">
                              {item.label}
                            </span>
                            {item.subLabel && (
                              <span className="text-[12px] text-[#7A736C] dark:text-[#9E9893]">
                                {item.subLabel}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
