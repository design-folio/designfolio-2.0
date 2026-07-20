import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Pencil, Globe, Lock, Copy, Check } from "lucide-react";
import { ZapIcon } from "lucide-animated";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { useGlobalContext } from "@/context/globalContext";
import { _publish, _updateUsername } from "@/network/post-request";
import { useUsernameAvailability } from "@/hooks/useUsernameAvailability";
import { formatTimestamp } from "@/lib/times";
import { toast } from "react-toastify";
import { usePostHogEvent } from "@/hooks/usePostHogEvent";
import { Spinner } from "@/components/ui/spinner";
import { POSTHOG_EVENT_NAMES } from "@/lib/posthogEventNames";

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

const dropdownVariants = {
  hidden: { opacity: 0, scale: 0.96, y: -8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 420,
      damping: 28,
      mass: 0.75,
      staggerChildren: 0.045,
      delayChildren: 0.02,
    },
  },
  exit: { opacity: 0, scale: 0.96, y: -8, transition: { duration: 0.14, ease: "easeIn" } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 420, damping: 30 } },
};

// Filter to a valid subdomain label as the user types.
const sanitizeSlug = (raw) =>
  raw
    .toLowerCase()
    .split("")
    .filter((char) => /[a-z0-9-\s]/.test(char))
    .join("")
    .replace(/\s+/g, "-");

export function PublishDropdown({ onClose, open: openProp, onOpenChange }) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = openProp !== undefined;
  const isOpen = isControlled ? openProp : uncontrolledOpen;
  const setIsOpen = (next) => {
    const value = typeof next === "function" ? next(isOpen) : next;
    if (!isControlled) setUncontrolledOpen(value);
    onOpenChange?.(value);
  };
  const [copied, setCopied] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [slug, setSlug] = useState("");
  const [isSavingSlug, setIsSavingSlug] = useState(false);

  const dropdownRef = useRef(null);
  const zapRef = useRef(null);
  const slugInputRef = useRef(null);

  const {
    userDetails,
    setUserDetails,
    updateCache,
    setShowUpgradeModal,
    setUpgradeModalSource,
    setShowSettingsModal,
    setSettingsModalTab,
  } = useGlobalContext();
  const phEvent = usePostHogEvent();

  const { username, latestPublishDate, email } = userDetails || {};
  const isPro = !!userDetails?.pro;

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN;
  const domain = `${username}.${baseDomain}`;
  const formattedDate = formatTimestamp(latestPublishDate);

  // Debounced availability for the slug editor. Skip checking the user's own
  // current username (it is "taken" by them) so unchanged is a clean no-op.
  const trimmedSlug = slug.trim();
  const unchanged = trimmedSlug === username;
  const {
    isChecking: slugChecking,
    isAvailable: slugAvailable,
    error: slugError,
  } = useUsernameAvailability(unchanged ? "" : trimmedSlug);
  const canSaveSlug =
    !!trimmedSlug && !unchanged && slugAvailable && !slugChecking && !slugError && !isSavingSlug;

  // Single derived state drives the row's border, icon, and status copy so the
  // availability signal lives in the field itself rather than a floating tick.
  const slugState =
    !isEditingSlug || !trimmedSlug || unchanged
      ? "idle"
      : slugChecking
        ? "checking"
        : slugError
          ? "error"
          : slugAvailable
            ? "available"
            : "idle";

  const slugRowStyle =
    slugState === "available"
      ? { background: "rgba(16,185,129,0.07)", border: "1px solid rgba(52,211,153,0.5)" }
      : slugState === "error"
        ? { background: "rgba(239,68,68,0.06)", border: "1px solid rgba(248,113,113,0.5)" }
        : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" };

  useClickAway(dropdownRef, () => {
    if (!isOpen) return;
    setIsOpen(false);
    setIsEditingSlug(false);
  });

  useEffect(() => {
    if (isEditingSlug) slugInputRef.current?.focus();
  }, [isEditingSlug]);

  const openSlugEditor = () => {
    setSlug(username || "");
    setIsEditingSlug(true);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${domain}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("URL copied successfully");
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const handleSaveSlug = () => {
    if (!canSaveSlug) return;
    setIsSavingSlug(true);
    _updateUsername({ username: trimmedSlug })
      .then(() => {
        setUserDetails((prev) => ({ ...prev, username: trimmedSlug }));
        updateCache("userDetails", { ...userDetails, username: trimmedSlug });
        toast.success("URL updated.");
        setIsEditingSlug(false);
      })
      .catch(() => toast.error("Couldn't update URL. Please try again."))
      .finally(() => setIsSavingSlug(false));
  };

  const openUpgrade = (source) => {
    phEvent(POSTHOG_EVENT_NAMES.UPGRADE_PRO_CLICKED, {
      premium_user: isPro,
      user_email: email,
      username,
      source,
    });
    setUpgradeModalSource(source);
    setShowUpgradeModal(true);
  };

  const handlePublish = () => {
    if (!isPro) {
      openUpgrade("publish-cta");
      return;
    }
    const isFirstPublish = !latestPublishDate;
    setIsPublishing(true);
    _publish({ status: 1 })
      .then((res) => {
        setUserDetails((prev) => ({ ...prev, ...res?.data?.user }));
        updateCache("userDetails", res?.data?.user);
        toast.success("Published successfully.");
        phEvent(
          isFirstPublish
            ? POSTHOG_EVENT_NAMES.PORTFOLIO_PUBLISHED
            : POSTHOG_EVENT_NAMES.EDIT_AFTER_PUBLISH,
          { email, username, publish_type: isFirstPublish ? "first_publish" : "updated" }
        );
        setIsOpen(false);
        onClose?.();
      })
      .finally(() => setIsPublishing(false));
  };

  const proCtaLabel = latestPublishDate
    ? isPublishing
      ? "Updating…"
      : "Update changes"
    : isPublishing
      ? "Publishing…"
      : "Publish now";

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative" ref={dropdownRef}>
        <Button
          onClick={() => setIsOpen((v) => !v)}
          onMouseEnter={() => zapRef.current?.startAnimation()}
          onMouseLeave={() => zapRef.current?.stopAnimation()}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-black pr-5 pl-4 text-[13px] font-medium text-white transition-colors hover:cursor-pointer hover:bg-[#2A2A2A] dark:bg-white dark:text-black dark:hover:bg-[#E8E8E8]"
          data-testid="button-publish"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <ZapIcon ref={zapRef} size={14} />
          Publish
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute top-full right-0 z-50 mt-2.5 w-[400px]"
              onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
              style={{ transformOrigin: "top right" }}
            >
              <div
                className="w-full overflow-hidden rounded-[20px]"
                style={{
                  background: "#1A1A1A",
                  boxShadow:
                    "0 0 0 0.5px rgba(255,255,255,0.07), 0 8px 24px rgba(0,0,0,0.28), 0 24px 48px rgba(0,0,0,0.18)",
                }}
              >
                <div className="flex flex-col gap-3.5 px-5 pt-5 pb-5">
                  {/* Heading */}
                  <motion.p
                    variants={rowVariants}
                    className="text-[13px] font-medium tracking-[-0.1px] text-white/40"
                  >
                    {latestPublishDate ? `Updated ${formattedDate}` : "Ready to publish."}
                  </motion.p>

                  {/* URL row / slug editor */}
                  <motion.div
                    variants={rowVariants}
                    className="flex items-center gap-2.5 rounded-[13px] px-3.5 py-2.5"
                    style={{
                      ...slugRowStyle,
                      transition: "background-color 200ms ease, border-color 200ms ease",
                    }}
                  >
                    {slugState === "checking" ? (
                      <Spinner className="size-3.5 shrink-0 text-white/45" />
                    ) : (
                      <Link2
                        size={14}
                        strokeWidth={2}
                        className={cn(
                          "shrink-0 transition-colors",
                          slugState === "available"
                            ? "text-emerald-400"
                            : slugState === "error"
                              ? "text-red-400/80"
                              : "text-white/35"
                        )}
                      />
                    )}

                    {isEditingSlug ? (
                      <div className="flex min-w-0 flex-1 items-center">
                        <input
                          ref={slugInputRef}
                          value={slug}
                          onChange={(e) => setSlug(sanitizeSlug(e.target.value))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveSlug();
                            if (e.key === "Escape") setIsEditingSlug(false);
                          }}
                          aria-label="Edit your portfolio URL"
                          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[13px] font-medium tracking-tight text-white/90 outline-none placeholder:text-white/30"
                          placeholder="yourname"
                        />
                        <span className="shrink-0 text-[13px] font-medium text-white/45">
                          .{baseDomain}
                        </span>
                      </div>
                    ) : isPro ? (
                      <button
                        type="button"
                        onClick={() => window.open(`https://${domain}`, "_blank")}
                        className="min-w-0 flex-1 cursor-pointer truncate text-left text-[13px] font-medium tracking-tight text-white/55 underline-offset-2 hover:underline"
                      >
                        <span className="text-white/80">{username}</span>.{baseDomain}
                      </button>
                    ) : (
                      <span className="min-w-0 flex-1 truncate text-[13px] font-medium tracking-tight text-white/55">
                        <span className="text-white/80">{username}</span>.{baseDomain}
                      </span>
                    )}

                    {isEditingSlug ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleSaveSlug}
                        disabled={!canSaveSlug}
                        aria-label="Confirm URL"
                        className={cn(
                          "size-7 shrink-0 rounded-[9px] transition-[background-color,color,transform,box-shadow] duration-150 active:scale-[0.96]",
                          canSaveSlug
                            ? "bg-white/10 text-white/80 shadow-[0_1px_2px_rgba(0,0,0,0.18)] hover:bg-white/16 hover:text-white hover:shadow-[0_2px_5px_rgba(0,0,0,0.22)]"
                            : "bg-white/5 text-white/25"
                        )}
                      >
                        {isSavingSlug ? (
                          <Spinner className="size-3.5" />
                        ) : (
                          <Check strokeWidth={2.5} />
                        )}
                      </Button>
                    ) : (
                      <div className="flex shrink-0 items-center gap-1">
                        {isPro && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleCopy}
                            aria-label="Copy URL"
                            className="relative size-7 rounded-[9px] text-white/60 hover:bg-white/10 hover:text-white"
                          >
                            <AnimatePresence mode="wait" initial={false}>
                              {copied ? (
                                <motion.span
                                  key="check"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute inset-0 flex items-center justify-center text-emerald-400"
                                >
                                  <Check size={12} strokeWidth={2.5} />
                                </motion.span>
                              ) : (
                                <motion.span
                                  key="copy"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute inset-0 flex items-center justify-center"
                                >
                                  <Copy size={12} strokeWidth={2} />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={openSlugEditor}
                          aria-label="Edit URL slug"
                          className="size-7 rounded-[9px] text-white/60 hover:bg-white/10 hover:text-white"
                        >
                          <Pencil strokeWidth={2} />
                        </Button>
                      </div>
                    )}
                  </motion.div>

                  {/* Slug editor status line — availability lives here + in the border */}
                  <AnimatePresence>
                    {(slugState === "available" || slugState === "error") && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className={cn(
                          "-mt-1.5 text-[12px] font-medium",
                          slugState === "error" ? "text-red-400" : "text-emerald-400"
                        )}
                      >
                        {slugState === "error" ? slugError : "This URL is available."}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Primary CTA */}
                  <motion.div variants={rowVariants}>
                    <Button
                      variant="tertiary"
                      onClick={isPro ? handlePublish : () => openUpgrade("publish-cta")}
                      disabled={isPublishing}
                      className="h-[50px] w-full rounded-[13px] text-[14px] font-semibold"
                    >
                      {isPublishing && <Spinner className="size-4" />}
                      {isPro ? proCtaLabel : "Upgrade to publish"}
                    </Button>
                  </motion.div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />

                {/* Footer: custom domain */}
                <motion.div
                  variants={rowVariants}
                  className="flex items-center justify-between gap-3 px-5 py-3.5"
                >
                  <div className="flex shrink-0 items-center gap-2">
                    <Globe size={15} strokeWidth={1.75} className="shrink-0 text-white/30" />
                    <span className="text-[13px] font-medium whitespace-nowrap text-white/35">
                      Connect custom domain
                    </span>
                  </div>

                  {isPro ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsOpen(false);
                        setSettingsModalTab("domains");
                        setShowSettingsModal(true);
                      }}
                      className="shrink-0 rounded-full text-white/60 hover:bg-white/10 hover:text-white"
                    >
                      Set up
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => openUpgrade("custom-domain")}
                      aria-label="Upgrade to unlock custom domain"
                      className="shrink-0 gap-1.5 rounded-full border border-[rgba(255,90,54,0.2)] bg-[rgba(255,90,54,0.12)] px-3 text-[12px] font-semibold text-[#FF5A36] transition-all duration-150 hover:border-[rgba(255,90,54,0.35)] hover:bg-[rgba(255,90,54,0.22)] hover:text-[#FF5A36] [&_svg]:size-[11px]"
                    >
                      <Lock strokeWidth={2.5} />
                      Upgrade to unlock
                    </Button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
