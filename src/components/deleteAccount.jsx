import React, { useState } from "react";
import { useRouter } from "next/router";
import { _deleteUser } from "@/network/post-request";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useGlobalContext } from "@/context/globalContext";
import queryClient from "@/network/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

// ── Edit this list to change the deletion reason options ─────────────────────
const DELETION_REASONS = [
  { id: "not-useful", label: "Didn't find it useful" },
  { id: "missing-features", label: "Missing features I need" },
  { id: "switching", label: "Switching to another tool" },
  { id: "expensive", label: "Too expensive" },
  { id: "exploring", label: "Just exploring, don't need it anymore" },
  { id: "other", label: "Other" },
];
// ─────────────────────────────────────────────────────────────────────────────

export default function DeleteAccount() {
  const router = useRouter();
  const { setUserDetails, setShowSettingsModal } = useGlobalContext();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("reason"); // "reason" | "confirm"
  const [selectedReason, setSelected] = useState(null);
  const [customReason, setCustom] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOpenChange = (val) => {
    setOpen(val);
    if (!val) {
      // reset after close animation completes
      setTimeout(() => {
        setStep("reason");
        setSelected(null);
        setCustom("");
        setConfirmText("");
      }, 200);
    }
  };

  const handleDeleteAccount = () => {
    setLoading(true);
    const payload = {
      reason: selectedReason === "other" ? customReason.trim() : selectedReason,
    };
    _deleteUser(payload)
      .then(() => {
        Cookies.remove("df-token", {
          domain: process.env.NEXT_PUBLIC_BASE_DOMAIN,
        });
        queryClient.removeQueries();
        setUserDetails(null);
        setShowSettingsModal(false);
        setLoading(false);
        toast.success("Account deleted successfully");
        router.replace("/");
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const canProceed =
    selectedReason !== null && (selectedReason !== "other" || customReason.trim().length > 0);

  return (
    <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
      <div>
        <p className="text-[18px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">Danger zone</p>
        <p className="mt-1 text-[13px] leading-relaxed text-[#7A736C] dark:text-[#B5AFA5]">
          Delete your account and account data. This can&apos;t be undone.
        </p>
      </div>

      <Button variant="destructive" className="w-full lg:w-fit" onClick={() => setOpen(true)}>
        Delete account
      </Button>

      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent className="max-w-[420px] rounded-2xl border border-[#E5D7C4] bg-white dark:border-white/10 dark:bg-[#2A2520]">
          {/* ── Step 1: Reason ── */}
          {step === "reason" && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-[#1A1A1A] dark:text-[#F0EDE7]">
                  Before you go…
                </AlertDialogTitle>
                <AlertDialogDescription className="leading-relaxed text-[#7A736C] dark:text-[#B5AFA5]">
                  Help us understand why you&apos;re leaving. It takes 5 seconds.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="flex flex-col gap-2 py-1">
                {DELETION_REASONS.map((reason, i) => (
                  <button
                    key={reason.id}
                    onClick={() => setSelected(reason.id)}
                    style={{ animationDelay: `${i * 40}ms` }}
                    className={[
                      "w-full rounded-xl border border-[#E5D7C4] px-4 py-3 text-left text-[13px] dark:border-white/10",
                      "cursor-pointer transition-all duration-150",
                      selectedReason === reason.id
                        ? "bg-black/[0.05] font-medium text-[#1A1A1A] dark:bg-white/[0.07] dark:text-[#F0EDE7]"
                        : "font-normal text-[#7A736C] hover:bg-black/[0.03] hover:text-[#1A1A1A] dark:text-[#9E9893] dark:hover:bg-white/[0.04] dark:hover:text-[#F0EDE7]",
                    ].join(" ")}
                  >
                    {reason.label}
                  </button>
                ))}

                {selectedReason === "other" && (
                  <Textarea
                    autoFocus
                    value={customReason}
                    onChange={(e) => setCustom(e.target.value)}
                    placeholder="Tell us more…"
                    className="mt-1 min-h-[72px] resize-none text-[13px] transition-all duration-150"
                  />
                )}
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  variant="destructive"
                  disabled={!canProceed}
                  onClick={() => setStep("confirm")}
                >
                  Continue
                </Button>
              </AlertDialogFooter>
            </>
          )}

          {/* ── Step 2: Confirm ── */}
          {step === "confirm" && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-[#1A1A1A] dark:text-[#F0EDE7]">
                  Delete Account
                </AlertDialogTitle>
                <AlertDialogDescription className="leading-relaxed text-[#7A736C] dark:text-[#B5AFA5]">
                  This action <strong className="text-[#1A1A1A] dark:text-[#F0EDE7]">CANNOT</strong>{" "}
                  be undone. This will permanently delete everything associated with this account,
                  from your published website to the content in draft—
                  <strong className="text-[#1A1A1A] dark:text-[#F0EDE7]">EVERYTHING</strong>.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="px-0">
                <p className="mb-2 text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
                  Please type <span className="font-bold">DELETE</span> to confirm
                </p>
                <Input
                  autoFocus
                  autoComplete="off"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                />
              </div>

              <AlertDialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setStep("reason")}
                  className="text-[#7A736C] hover:text-[#1A1A1A] dark:text-[#B5AFA5] dark:hover:text-[#F0EDE7]"
                >
                  Back
                </Button>
                <Button
                  variant="destructive"
                  disabled={confirmText !== "DELETE" || loading}
                  onClick={handleDeleteAccount}
                >
                  {loading ? "Deleting…" : "Delete account"}
                </Button>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
