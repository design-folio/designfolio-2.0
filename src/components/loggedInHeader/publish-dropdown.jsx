import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Pencil, Globe, Lock, Copy, Check, X } from "lucide-react";
import { ZapIcon } from "lucide-animated";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { useRouter } from "next/router";
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

export function PublishDropdown({ onClose }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [slug, setSlug] = useState("");
  const [isSavingSlug, setIsSavingSlug] = useState(false);

  const dropdownRef = useRef(null);
  const zapRef = useRef(null);
  const slugInputRef = useRef(null);
  const router = useRouter();

  const { userDetails, setUserDetails, updateCache, setShowUpgradeModal, setUpgradeModalSource } =
    useGlobalContext();
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

  useClickAway(dropdownRef, () => {
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

  const openUpgrade = () => {
    setUpgradeModalSource("pro-template");
    setShowUpgradeModal(true);
  };

  const handlePublish = () => {
    if (!isPro) {
      openUpgrade();
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
              className="absolute top-full right-0 z-50 mt-2.5 w-[360px]"
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
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.09)",
                    }}
                  >
                    <Link2 size={14} strokeWidth={2} className="shrink-0 text-white/35" />

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
                    ) : (
                      <button
                        type="button"
                        onClick={() => window.open(`https://${domain}`, "_blank")}
                        className="min-w-0 flex-1 truncate text-left text-[13px] font-medium tracking-tight text-white/55 underline-offset-2 hover:underline"
                      >
                        <span className="text-white/80">{username}</span>.{baseDomain}
                      </button>
                    )}

                    {isEditingSlug ? (
                      <div className="flex shrink-0 items-center gap-1">
                        {slugChecking && <Spinner className="size-3.5 text-white/40" />}
                        {!slugChecking && trimmedSlug && !unchanged && slugAvailable && (
                          <Check size={13} strokeWidth={2.5} className="text-emerald-400" />
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={handleSaveSlug}
                          disabled={!canSaveSlug}
                          aria-label="Save URL"
                          className="size-7 rounded-[9px] text-white/70 hover:bg-white/10 hover:text-white"
                        >
                          {isSavingSlug ? (
                            <Spinner className="size-3.5" />
                          ) : (
                            <Check strokeWidth={2.5} />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsEditingSlug(false)}
                          aria-label="Cancel"
                          className="size-7 rounded-[9px] text-white/60 hover:bg-white/10 hover:text-white"
                        >
                          <X strokeWidth={2.5} />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex shrink-0 items-center gap-1">
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

                  {/* Slug editor status line */}
                  <AnimatePresence>
                    {isEditingSlug && (slugError || (slugChecking && !unchanged)) && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className={cn(
                          "-mt-1.5 text-[12px] font-medium",
                          slugError ? "text-red-400" : "text-white/40"
                        )}
                      >
                        {slugChecking ? "Checking availability…" : slugError}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Primary CTA */}
                  <motion.div variants={rowVariants}>
                    <Button
                      variant="tertiary"
                      onClick={isPro ? handlePublish : openUpgrade}
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
                  <div className="flex min-w-0 items-center gap-2">
                    <Globe size={15} strokeWidth={1.75} className="shrink-0 text-white/30" />
                    <span className="truncate text-[13px] font-medium text-white/35">
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
                        router.push("/domains");
                      }}
                      className="shrink-0 rounded-full text-white/60 hover:bg-white/10 hover:text-white"
                    >
                      Set up
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="tertiary"
                      size="sm"
                      onClick={openUpgrade}
                      aria-label="Upgrade to unlock custom domain"
                      className="shrink-0 rounded-full"
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
