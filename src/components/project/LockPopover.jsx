import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Eye, EyeOff } from "lucide-react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { _updateProject } from "@/network/post-request";
import { useGlobalContext } from "@/context/globalContext";
import { useProGate } from "@/hooks/useProGate";
import { Button } from "../ui/button";

const popoverVariants = {
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

export default function LockPopover({ project, dark, open, onOpenChange }) {
  const { userDetails } = useGlobalContext();
  const requirePro = useProGate();
  const isPro = !!userDetails?.pro;

  const [enabled, setEnabled] = useState(!!project?.protected);
  const [pwd, setPwd] = useState(project?.password ?? "");
  const [saving, setSaving] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const save = useCallback(
    async (newEnabled, newPwd) => {
      if (!project?._id || saving) return;
      setSaving(true);
      try {
        await _updateProject(project._id, {
          protected: newEnabled,
          password: newEnabled ? newPwd : "",
        });
      } finally {
        setSaving(false);
      }
    },
    [project?._id, saving]
  );

  const handleToggle = (val) => {
    setEnabled(val);
    save(val, pwd);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          title="Password protect this project"
          className={cn(
            "group flex h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-all",
            dark
              ? "border-white/10 bg-white/10 text-white/80 hover:bg-white/20"
              : "border-black/10 bg-white/50 text-[#1A1A1A] hover:bg-black/5 dark:border-white/10 dark:bg-[#2A2520]/50 dark:text-[#F0EDE7] dark:hover:bg-white/5"
          )}
        >
          <Lock size={15} strokeWidth={2} className="shrink-0" />
          <span className="hidden sm:inline">Password Protect</span>
        </button>
      </PopoverTrigger>
      <AnimatePresence>
        {open && (
          <PopoverPrimitive.Portal forceMount>
            <PopoverPrimitive.Content asChild forceMount align="end" sideOffset={8}>
              <motion.div
                variants={popoverVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{
                  transformOrigin: "var(--radix-popover-content-transform-origin)",
                  boxShadow:
                    "0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 24px -4px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.04)",
                }}
                className="z-50 w-72 overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-0 outline-none dark:border-white/[0.08] dark:bg-[#2A2520]"
              >
                {isPro ? (
                  <div className="p-4">
                    <motion.div
                      variants={rowVariants}
                      className="mb-3 flex items-start justify-between px-1"
                    >
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
                          Protect Project
                        </p>
                        <p className="max-w-[160px] text-[13px] leading-snug text-[#7A736C] dark:text-[#9E9893]">
                          Require a password to view this project (e.g., for NDAs).
                        </p>
                      </div>
                      <Switch
                        checked={enabled}
                        onCheckedChange={handleToggle}
                        className="mt-0.5 data-[state=checked]:bg-[#1A1A1A] data-[state=unchecked]:bg-black/15 dark:data-[state=checked]:bg-[#F0EDE7] dark:data-[state=unchecked]:bg-white/15"
                      />
                    </motion.div>
                    <AnimatePresence>
                      {enabled && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="p-1">
                            <div className="relative">
                              <Input
                                type={showPwd ? "text" : "password"}
                                placeholder="Enter password"
                                value={pwd}
                                onChange={(e) => setPwd(e.target.value)}
                                onBlur={() => save(enabled, pwd)}
                                className="h-9 pr-9 text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPwd((v) => !v)}
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-[#7A736C] transition-colors hover:text-[#1A1A1A] dark:text-[#9E9893] dark:hover:text-[#F0EDE7]"
                              >
                                {showPwd ? (
                                  <EyeOff size={14} strokeWidth={2} />
                                ) : (
                                  <Eye size={14} strokeWidth={2} />
                                )}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {/* Optional preview image — hidden gracefully if the asset is absent */}
                    <motion.img
                      variants={rowVariants}
                      src="/assets/png/custompassword.png"
                      alt="password-protect"
                      draggable={false}
                      className="block w-full"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <motion.div variants={rowVariants} className="flex flex-col gap-1 px-4 pt-4">
                      <p className="text-[15px] font-semibold tracking-[-0.2px] text-[#1A1A1A] dark:text-[#F0EDE7]">
                        Unlock password protection
                      </p>
                      <p className="text-[13px] leading-snug text-[#7A736C] dark:text-[#9E9893]">
                        Protect your projects with a password (e.g., for NDAs).
                      </p>
                    </motion.div>
                    <motion.div variants={rowVariants} className="p-4">
                      <Button
                        size="lg"
                        variant="tertiary"
                        onClick={() => requirePro("password-protect")}
                        className="h-[46px] w-full rounded-xl"
                      >
                        Upgrade to unlock
                      </Button>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        )}
      </AnimatePresence>
    </Popover>
  );
}
