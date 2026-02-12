import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";
import Button from "../button";
import { Button as ButtonNew } from "./buttonNew";

/**
 * Dialog shown on the builder when user has pending resume data and an existing profile.
 * Asks whether to replace the current portfolio with resume content or keep it.
 */
export const ReplacePortfolioDialog = ({
  open,
  onOpenChange,
  onKeepCurrent,
  onReplace,
  title = "Replace existing portfolio?",
  description = "We detected resume-based content from the landing page. Do you want to replace your current profile with it, or keep your existing portfolio?",
  keepText = "Keep current portfolio",
  replaceText = "Replace with resume content",
}) => {
  const handleKeep = () => {
    onKeepCurrent?.();
    onOpenChange?.(false);
  };

  const handleReplace = () => {
    onReplace?.();
    onOpenChange?.(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-border">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            type="secondary"
            onClick={handleKeep}
            text={keepText}
          />
          <ButtonNew
            className="rounded-full"
            variant="destructive"
            onClick={handleReplace}
          >
            {replaceText}
          </ButtonNew>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
