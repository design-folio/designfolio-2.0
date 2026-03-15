import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { useGlobalContext } from "@/context/globalContext";
import { _publish } from "@/network/post-request";
import { formatTimestamp } from "@/lib/times";
import { toast } from "react-toastify";
import { usePostHogEvent } from "@/hooks/usePostHogEvent";
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

export function PublishDropdown({ onClose }) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const dropdownRef = useRef(null);

  const { userDetails, setUserDetails, updateCache } = useGlobalContext();
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

  const handlePublish = () => {
    setIsPublishing(true);
    const isFirstPublished = !latestPublishDate;
    _publish({ status: 1 })
      .then((res) => {
        setUserDetails((prev) => ({ ...prev, ...res?.data?.user }));
        updateCache("userDetails", res?.data?.user);
        toast.success("Published successfully.");
        if (isFirstPublished) {
          phEvent(POSTHOG_EVENT_NAMES.PORTFOLIO_PUBLISHED, { email, username, publish_type: "first_publish" });
        } else {
          phEvent(POSTHOG_EVENT_NAMES.EDIT_AFTER_PUBLISH, { email, username, publish_type: "updated" });
        }
        setIsOpen(false);
        onClose?.();
      })
      .finally(() => setIsPublishing(false));
  };

  const handleFirstPublish = () => {
    if (!latestPublishDate) {
      handlePublish();
    } else {
      setIsOpen((v) => !v);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative" ref={dropdownRef}>
        <Button
          onClick={handleFirstPublish}
          disabled={isPublishing}
          className="bg-black hover:bg-[#2A2A2A] dark:bg-white dark:hover:bg-[#E8E8E8] text-white dark:text-black font-medium px-6 h-9 text-[13px] rounded-full hover:cursor-pointer transition-colors"
          data-testid="button-publish"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {isPublishing ? "Publishing…" : "Publish"}
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.15, ease: "easeOut" } }}
              exit={{ opacity: 0, y: -4, transition: { duration: 0.15, ease: "easeIn" } }}
              className="absolute right-0 top-full mt-2 z-50 min-w-[260px]"
              onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
              style={{ transformOrigin: "top right" }}
            >
              <div className="w-full rounded-2xl border border-border bg-card p-1.5 shadow-lg overflow-hidden">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between gap-3 px-3 py-2">
                    <div
                      className="flex flex-col gap-0.5 overflow-hidden cursor-pointer"
                      onClick={() => window.open(`https://${domain}`, "_blank")}
                    >
                      <span className="text-[13px] font-medium text-foreground truncate hover:underline underline-offset-2">
                        {domain}
                      </span>
                      <span className="text-[12px] text-muted-foreground">
                        {latestPublishDate ? `Updated ${formattedDate}` : "Not published yet"}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopy}
                      className="h-8 w-8 rounded-xl shrink-0 cursor-pointer text-muted-foreground hover:bg-secondary/50 hover:text-foreground relative"
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {copied ? (
                          <motion.div key="check" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.15 }} className="absolute inset-0 flex items-center justify-center text-foreground">
                            <Check className="h-4 w-4" />
                          </motion.div>
                        ) : (
                          <motion.div key="copy" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.15 }} className="absolute inset-0 flex items-center justify-center">
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
                      "relative z-10 flex w-full items-center justify-center px-3 h-[44px] text-[13px] font-medium rounded-xl transition-colors duration-150 focus:outline-none cursor-pointer mt-1",
                      isPublishing
                        ? "bg-secondary/50 text-muted-foreground"
                        : "bg-secondary/50 hover:bg-secondary text-foreground"
                    )}
                  >
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
