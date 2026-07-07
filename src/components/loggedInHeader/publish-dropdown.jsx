import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { ZapIcon } from "lucide-animated";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { useGlobalContext } from "@/context/globalContext";
import { _publish } from "@/network/post-request";
import { formatTimestamp } from "@/lib/times";
import { toast } from "react-toastify";
import { usePostHogEvent } from "@/hooks/usePostHogEvent";
import { Spinner } from "@/components/ui/spinner";
import { POSTHOG_EVENT_NAMES } from "@/lib/posthogEventNames";
import { TEMPLATES_BY_ID } from "@/lib/templates";

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

export function PublishDropdown({ onClose }) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const dropdownRef = useRef(null);
  const zapRef = useRef(null);

  const {
    userDetails,
    setUserDetails,
    updateCache,
    template,
    setShowUpgradeModal,
    setUpgradeModalSource,
  } = useGlobalContext();
  const phEvent = usePostHogEvent();

  const { username, latestPublishDate, email } = userDetails || {};

  const formattedDate = formatTimestamp(latestPublishDate);
  const domain = `${username}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}`;

  useClickAway(dropdownRef, () => setIsOpen(false));

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(domain);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("URL copied successfully");
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const handlePublish = (isFirstPublish = false) => {
    if (!userDetails?.pro && TEMPLATES_BY_ID[template]?.isPro) {
      setUpgradeModalSource("pro-template");
      setShowUpgradeModal(true);
      return;
    }
    setIsPublishing(true);
    _publish({ status: 1 })
      .then((res) => {
        setUserDetails((prev) => ({ ...prev, ...res?.data?.user }));
        updateCache("userDetails", res?.data?.user);
        toast.success("Published successfully.");
        if (isFirstPublish) {
          phEvent(POSTHOG_EVENT_NAMES.PORTFOLIO_PUBLISHED, {
            email,
            username,
            publish_type: "first_publish",
          });
          setIsOpen(true);
        } else {
          phEvent(POSTHOG_EVENT_NAMES.EDIT_AFTER_PUBLISH, {
            email,
            username,
            publish_type: "updated",
          });
          setIsOpen(false);
          onClose?.();
        }
      })
      .finally(() => setIsPublishing(false));
  };

  const handleButtonClick = () => {
    if (!latestPublishDate) {
      handlePublish(true);
    } else {
      setIsOpen((v) => !v);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative" ref={dropdownRef}>
        <Button
          onClick={handleButtonClick}
          disabled={isPublishing}
          onMouseEnter={() => !isPublishing && zapRef.current?.startAnimation()}
          onMouseLeave={() => zapRef.current?.stopAnimation()}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-black pr-5 pl-4 text-[13px] font-medium text-white transition-colors hover:cursor-pointer hover:bg-[#2A2A2A] dark:bg-white dark:text-black dark:hover:bg-[#E8E8E8]"
          data-testid="button-publish"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {isPublishing ? <Spinner className="size-3.5" /> : <ZapIcon ref={zapRef} size={14} />}
          Publish
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="publish-dropdown"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.15, ease: "easeOut" } }}
              exit={{
                opacity: 0,
                y: -4,
                pointerEvents: "none",
                transition: { duration: 0.15, ease: "easeIn" },
              }}
              className="absolute top-full right-0 z-50 mt-2 min-w-[260px]"
              onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
              style={{ transformOrigin: "top right" }}
            >
              <div
                className="w-full overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-1.5 dark:border-white/[0.08] dark:bg-[#2A2520]"
                style={{
                  boxShadow:
                    "0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 24px -4px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.04)",
                }}
              >
                <div className="flex flex-col">
                  <div className="flex items-center justify-between gap-3 px-3 py-2">
                    <div
                      className="flex cursor-pointer flex-col gap-0.5 overflow-hidden"
                      onClick={() => window.open(`https://${domain}`, "_blank")}
                    >
                      <span className="truncate text-[13px] font-medium text-[#1A1A1A] underline-offset-2 hover:underline dark:text-[#F0EDE7]">
                        {domain}
                      </span>
                      {latestPublishDate && (
                        <span className="text-[12px] text-[#7A736C] dark:text-[#9E9893]">
                          Updated {formattedDate}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopy}
                      className="relative h-8 w-8 shrink-0 cursor-pointer rounded-xl text-[#7A736C] hover:bg-black/5 hover:text-[#1A1A1A] dark:text-[#9E9893] dark:hover:bg-white/5 dark:hover:text-[#F0EDE7]"
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {copied ? (
                          <motion.div
                            key="check"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.15 }}
                            className="absolute inset-0 flex items-center justify-center text-[#1A1A1A] dark:text-[#F0EDE7]"
                          >
                            <Check className="h-4 w-4" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="copy"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.15 }}
                            className="absolute inset-0 flex cursor-pointer items-center justify-center"
                          >
                            <Copy className="h-4 w-4" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </div>

                  <button
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className={cn(
                      "relative z-10 mt-1 flex h-[44px] w-full items-center justify-center gap-2 rounded-xl px-3 text-[13px] font-medium transition-colors duration-150 focus:outline-none",
                      isPublishing
                        ? "cursor-not-allowed bg-black/5 text-[#7A736C] dark:bg-white/5 dark:text-[#9E9893]"
                        : "cursor-pointer bg-black/5 text-[#1A1A1A] hover:bg-black/10 dark:bg-white/5 dark:text-[#F0EDE7] dark:hover:bg-white/10"
                    )}
                  >
                    {isPublishing && <Spinner className="size-3.5" />}
                    {isPublishing ? "Updating…" : "Update changes"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
