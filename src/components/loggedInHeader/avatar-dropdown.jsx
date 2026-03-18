import React, { useState, useRef, Suspense, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
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

export function AvatarDropdown({ onClose }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [diamondLottie, setDiamondLottie] = useState(null);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const phEvent = usePostHogEvent();

  const { userDetails, setUserDetails, setShowUpgradeModal, setUpgradeModalUnhideProject } = useGlobalContext();

  useEffect(() => {
    fetch("/lottie/diamond-lottie.json")
      .then((res) => res.json())
      .then(setDiamondLottie)
      .catch(() => { });
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
    router.push("/settings");
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
    ...(!userDetails?.pro ? [{ id: "upgrade", label: "Upgrade PRO", icon: null, action: handleUpgrade, isUpgrade: true }] : []),
    { id: "settings", label: "Settings", subLabel: "Custom Domains, Username and more", icon: Settings, action: handleSettings },
    { id: "logout", label: "Logout", icon: LogOut, action: handleLogout, isDanger: true },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="rounded-full focus:outline-none focus:ring-2 focus:ring-border transition-all cursor-pointer block"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <div className="relative">
            <Avatar className="h-9 w-9 border border-border flex-shrink-0 transition-transform hover:scale-105">
              <AvatarImage src={getUserAvatarImage(userDetails)} alt="Profile" className="object-cover cursor-pointer" />
              <AvatarFallback>{userDetails?.username?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-800 border border-border px-1.5 py-0.5 rounded-full shadow-sm whitespace-nowrap cursor-pointer">
              <span className="text-[8px] font-bold uppercase tracking-wider text-black dark:text-white leading-none block">
                {userDetails?.pro ? "PRO" : "Free"}
              </span>
            </div>
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.15, ease: "easeOut" } }}
              exit={{ opacity: 0, y: -4, transition: { duration: 0.15, ease: "easeIn" } }}
              className="absolute right-0 top-full mt-2 z-50 min-w-[280px]"
              onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
              style={{ transformOrigin: "top right" }}
            >
              <div className="w-full rounded-2xl border border-border bg-card p-1.5 shadow-lg overflow-hidden">
                <div className="relative flex flex-col" onMouseLeave={() => setHoveredId(null)}>
                  {menuItems.map((item) => {
                    const isActive = hoveredId === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onMouseEnter={() => setHoveredId(item.id)}
                        onClick={item.action}
                        className="relative w-full text-left focus:outline-none cursor-pointer group"
                      >
                        {isActive && (
                          <motion.div
                            layoutId="avatar-dropdown-highlight"
                            className={`absolute inset-0 rounded-xl z-0 ${item.isDanger ? "bg-red-50 dark:bg-red-950/30" : "bg-secondary/50"}`}
                            initial={false}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                          />
                        )}
                        <div className={`relative z-10 flex items-center w-full px-3 py-3 rounded-xl transition-colors duration-150 ${item.isDanger ? "text-destructive" : "text-foreground"}`}>
                          <div className="flex items-center justify-center shrink-0 mr-3 w-8 h-8 rounded-full bg-black/[0.03] dark:bg-white/[0.03]">
                            {item.isUpgrade ? (
                              <Suspense fallback={<Crown className="w-4 h-4 text-[#FF553E]" />}>
                                {diamondLottie ? (
                                  <Lottie animationData={diamondLottie} style={{ width: 32, height: 32 }} loop />
                                ) : (
                                  <Crown className="w-4 h-4 text-[#FF553E]" />
                                )}
                              </Suspense>
                            ) : Icon ? (
                              <Icon className="w-4 h-4" />
                            ) : null}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[13px] font-semibold leading-none">{item.label}</span>
                            {item.subLabel && (
                              <span className="text-[12px] text-muted-foreground">{item.subLabel}</span>
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
