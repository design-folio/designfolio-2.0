import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useGlobalContext } from "@/context/globalContext";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import { User, Globe, CreditCard, Shield, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import DefaultDomain from "@/components/defaultDomain";
import CustomDomain from "@/components/customDomain";
import ProSection from "@/components/ProSection";
import ChangePassword from "@/components/changePassword";
import DeleteAccount from "@/components/deleteAccount";
import Cookies from "js-cookie";
import queryClient from "@/network/queryClient";
import { removeCursor } from "@/lib/cursor";
import { useRouter } from "next/router";
import { useIsMobile } from "@/hooks/use-mobile";

/* ─────────────────────────── constants ─────────────────────────── */

const TABS = [
  { id: "account", label: "Account", icon: User },
  { id: "domains", label: "Domains", icon: Globe },
  { id: "subscription", label: "Subscription", icon: CreditCard },
  { id: "security", label: "Security", icon: Shield },
];

/* ─────────────────────────── shared primitives ─────────────────── */

function SectionBlock({ title, children }) {
  return (
    <div>
      <h2 className="text-[18px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">{title}</h2>
      <Separator className="mt-3 mb-6" />
      {children}
    </div>
  );
}

function SectionDivider() {
  return <Separator />;
}

/* ─────────────────────────── tab panels ────────────────────────── */

function AccountTab({ userDetails, onSignOut }) {
  return (
    <div className="flex flex-col gap-7">
      {/* ── Profile ── */}
      <SectionBlock title="Profile">
        {/* Avatar row */}
        <div className="flex items-center gap-4">
          <Avatar className="size-14 shrink-0 border border-black/10 dark:border-white/10">
            <AvatarImage src={getUserAvatarImage(userDetails)} className="object-cover" />
            <AvatarFallback className="bg-[#F0EDE7] text-base font-semibold text-[#1A1A1A] dark:bg-[#2A2520] dark:text-[#F0EDE7]">
              {userDetails?.username?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-[15px] leading-snug font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
              {[userDetails?.firstName, userDetails?.lastName].filter(Boolean).join(" ") ||
                userDetails?.username}
            </p>
            <p className="mt-0.5 text-[13px] text-[#7A736C] dark:text-[#9E9893]">
              {userDetails?.email}
            </p>
          </div>
        </div>
      </SectionBlock>

      <SectionDivider />

      {/* ── Username / Base Domain ── */}
      {/* DefaultDomain renders its own "Base domain" heading */}
      <DefaultDomain />

      <SectionDivider />

      {/* ── System ── */}
      <SectionBlock title="System">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[14px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
              Sign out from this device
            </p>
            <p className="mt-0.5 text-[13px] text-[#7A736C] dark:text-[#9E9893]">
              You are signed in as {userDetails?.email}
            </p>
          </div>
          <Button variant="outline" size="sm" className="shrink-0" onClick={onSignOut}>
            <LogOut data-icon="inline-start" />
            Sign out
          </Button>
        </div>
      </SectionBlock>
    </div>
  );
}

function DomainsTab({ domainDetails, fetchDomainDetails }) {
  return (
    <div className="flex flex-col gap-7">
      {/* DefaultDomain renders its own "Base domain" heading */}
      <DefaultDomain />
      <SectionDivider />
      {/* CustomDomain renders its own "Custom domain" heading */}
      <CustomDomain domainDetails={domainDetails} fetchDomainDetails={fetchDomainDetails} />
    </div>
  );
}

function SubscriptionTab() {
  /* ProSection renders its own "Plan & Billing" heading */
  return <ProSection />;
}

function SecurityTab({ userDetails }) {
  const isPasswordLogin = userDetails?.loginMethod === 0;

  return (
    <div className="flex flex-col gap-7">
      {/* ChangePassword renders its own "Change password" heading */}
      {isPasswordLogin && (
        <>
          <ChangePassword />
          <SectionDivider />
        </>
      )}

      {/* DeleteAccount renders its own "Danger zone" heading */}
      <DeleteAccount />
    </div>
  );
}

/* ─────────────────────────── mobile tab bar ────────────────────── */

function MobileTabBar({ activeTab, setActiveTab }) {
  return (
    <div className="shrink-0 border-b border-black/[0.06] dark:border-white/[0.06]">
      <div className="px-5 pt-5 pb-2">
        <span className="text-[13px] font-semibold tracking-[0.01em] text-[#1A1A1A] dark:text-[#F0EDE7]">
          Settings
        </span>
      </div>
      <div className="hide-scrollbar relative flex overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex shrink-0 items-center gap-1.5 px-4 pb-3 text-[13px] whitespace-nowrap transition-colors focus:outline-none",
                isActive
                  ? "font-medium text-[#1A1A1A] dark:text-[#F0EDE7]"
                  : "text-[#7A736C] dark:text-[#9E9893]"
              )}
            >
              <Icon className="size-[14px] shrink-0" />
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="settings-mobile-indicator"
                  className="absolute right-0 bottom-0 left-0 h-[2px] rounded-full bg-[#1A1A1A] dark:bg-[#F0EDE7]"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.15, duration: 0.3 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────── sidebar nav ───────────────────────── */

function SidebarNav({ activeTab, setActiveTab }) {
  const [hoveredTab, setHoveredTab] = useState(null);

  return (
    <nav className="flex-1 px-2" onMouseLeave={() => setHoveredTab(null)}>
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const isHovered = hoveredTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            onMouseEnter={() => setHoveredTab(tab.id)}
            className="relative mb-0.5 flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-[7px] text-left focus:outline-none"
          >
            {isActive && (
              <motion.div
                layoutId="settings-tab-active"
                className="pointer-events-none absolute inset-0 rounded-xl bg-black/[0.07] dark:bg-white/[0.07]"
                initial={false}
                transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
              />
            )}
            {!isActive && isHovered && (
              <div className="pointer-events-none absolute inset-0 rounded-xl bg-black/[0.04] dark:bg-white/[0.04]" />
            )}
            <Icon
              className={cn(
                "relative z-10 size-[15px] shrink-0 cursor-pointer",
                isActive
                  ? "text-[#1A1A1A] dark:text-[#F0EDE7]"
                  : "text-[#7A736C] dark:text-[#9E9893]"
              )}
            />
            <span
              className={cn(
                "relative z-10 cursor-pointer text-[13px]",
                isActive
                  ? "font-medium text-[#1A1A1A] dark:text-[#F0EDE7]"
                  : "font-normal text-[#7A736C] dark:text-[#9E9893]"
              )}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

/* ─────────────────────────── shared tab content ────────────────── */

function TabContent({
  activeTab,
  userDetails,
  domainDetails,
  fetchDomainDetails,
  onSignOut,
  padding,
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
        className={padding}
      >
        {activeTab === "account" && <AccountTab userDetails={userDetails} onSignOut={onSignOut} />}
        {activeTab === "domains" && (
          <DomainsTab domainDetails={domainDetails} fetchDomainDetails={fetchDomainDetails} />
        )}
        {activeTab === "subscription" && <SubscriptionTab />}
        {activeTab === "security" && <SecurityTab userDetails={userDetails} />}
      </motion.div>
    </AnimatePresence>
  );
}

/* ─────────────────────────── modal root ────────────────────────── */

export default function SettingsModal() {
  const {
    showSettingsModal,
    setShowSettingsModal,
    settingsModalTab,
    userDetails,
    setUserDetails,
    domainDetails,
    fetchDomainDetails,
  } = useGlobalContext();

  const [activeTab, setActiveTab] = useState("account");
  const isMobile = useIsMobile();
  const router = useRouter();

  // Jump to the requested tab whenever the modal transitions to open
  // (e.g. "Setup domain" should land on Domains, not whatever tab was last open).
  // Adjusted during render (React's recommended alternative to an effect here)
  // so it takes effect before paint instead of causing an extra render pass.
  const [wasOpen, setWasOpen] = useState(showSettingsModal);
  if (showSettingsModal !== wasOpen) {
    setWasOpen(showSettingsModal);
    if (showSettingsModal) setActiveTab(settingsModalTab || "account");
  }

  const handleSignOut = () => {
    setUserDetails(null);
    queryClient.removeQueries();
    Cookies.remove("df-token", { domain: process.env.NEXT_PUBLIC_BASE_DOMAIN });
    localStorage.removeItem("bottom_notification_seen");
    removeCursor();
    setShowSettingsModal(false);
    router.replace("/");
  };

  const sharedProps = {
    activeTab,
    userDetails,
    domainDetails,
    fetchDomainDetails,
    onSignOut: handleSignOut,
  };

  /* ── Mobile: bottom sheet ── */
  if (isMobile) {
    return (
      <Sheet open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <SheetContent
          side="bottom"
          className="flex h-[90dvh] flex-col rounded-t-3xl border-t border-black/10 bg-white p-0 dark:border-white/10 dark:bg-[#1C1C1C]"
        >
          <SheetTitle className="sr-only">Settings</SheetTitle>
          <MobileTabBar activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="custom-thin-scrollbar min-h-0 flex-1 overflow-y-auto">
            <TabContent {...sharedProps} padding="p-5 pb-10" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  /* ── Desktop: centered dialog ── */
  return (
    <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
      <DialogContent
        overlayClassName="z-[201]"
        className="z-[202] flex h-[580px] max-w-[860px] flex-col gap-0 overflow-hidden rounded-2xl border border-black/10 bg-white p-0 shadow-2xl dark:border-white/10 dark:bg-[#1C1C1C]"
      >
        <DialogTitle className="sr-only">Settings</DialogTitle>

        <div className="flex min-h-0 flex-1">
          {/* ── Left sidebar ── */}
          <div className="flex w-[210px] shrink-0 flex-col overflow-hidden rounded-l-2xl border-r border-black/[0.06] bg-[#F7F6F4] dark:border-white/[0.06] dark:bg-[#161616]">
            <div className="px-5 pt-5 pb-4">
              <span className="text-[13px] font-semibold tracking-[0.01em] text-[#1A1A1A] dark:text-[#F0EDE7]">
                Settings
              </span>
            </div>
            <SidebarNav activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          {/* ── Right content ── */}
          <div className="custom-thin-scrollbar min-w-0 flex-1 overflow-y-auto rounded-r-2xl">
            <TabContent {...sharedProps} padding="p-8 pr-10" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
