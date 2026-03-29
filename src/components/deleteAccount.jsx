import React, { useState } from "react";
import { useRouter } from "next/router";
import { _deleteUser } from "@/network/post-request";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useGlobalContext } from "@/context/globalContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

export default function DeleteAccount() {
  const router = useRouter();
  const { setUserDetails } = useGlobalContext();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDeleteAccount = () => {
    setLoading(true);
    setText("");
    _deleteUser().then(() => {
      toast.success("Account deleted successfully");
      Cookies.remove("df-token", {
        domain: process.env.NEXT_PUBLIC_BASE_DOMAIN,
      });
      setUserDetails(null);
      setLoading(false);
      router.push("/");
    });
  };

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
      <div>
        <p className="text-[18px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
          Danger zone
        </p>
        <p className="text-[13px] text-[#7A736C] dark:text-[#B5AFA5] mt-1 leading-relaxed">
          Delete your account and account data. This can&apos;t be undone.
        </p>
      </div>

      <Button
        variant="destructive"
        className="w-full lg:w-fit rounded-full"
        onClick={() => setOpen(true)}
      >
        Delete account
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="max-w-[420px] rounded-2xl bg-white dark:bg-[#2A2520] border border-[#E5D7C4] dark:border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#1A1A1A] dark:text-[#F0EDE7]">
              Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#7A736C] dark:text-[#B5AFA5] leading-relaxed">
              This action <strong className="text-[#1A1A1A] dark:text-[#F0EDE7]">CANNOT</strong> be undone. This will permanently delete
              everything associated with this account, from your published website to
              the content in draft—<strong className="text-[#1A1A1A] dark:text-[#F0EDE7]">EVERYTHING</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="px-0">
            <p className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] mb-2">
              Please type <span className="font-bold">DELETE</span> to confirm
            </p>
            <Input
              autoComplete="off"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="DELETE"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              className="rounded-full"
              disabled={text !== "DELETE" || loading}
              onClick={handleDeleteAccount}
            >
              {loading ? "Deleting…" : "Delete account"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
