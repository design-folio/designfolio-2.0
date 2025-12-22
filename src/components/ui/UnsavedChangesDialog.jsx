import React, { useEffect } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";
import Button from "../button";

/**
 * Reusable unsaved changes warning dialog
 */
export const UnsavedChangesDialog = ({
  open,
  onOpenChange,
  onConfirmDiscard,
  title = "Unsaved Changes",
  description = "You have made changes to this testimonial. Are you sure you want to discard them?",
  confirmText = "Discard Changes",
  cancelText = "Keep Editing",
}) => {
  // Prevent Radix UI from adding padding-right (conflicts with CustomSheet's margin-right)
  useEffect(() => {
    if (open) {
      const bodyStyle = document.body.style;
      const computedStyle = window.getComputedStyle(document.body);
      const initialPaddingRight = computedStyle.paddingRight;

      const observer = new MutationObserver(() => {
        const currentComputed = window.getComputedStyle(document.body);
        if (currentComputed.paddingRight !== initialPaddingRight && bodyStyle.marginRight) {
          document.body.style.paddingRight = initialPaddingRight;
        }
      });

      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['style'],
      });

      return () => {
        observer.disconnect();
        document.body.style.paddingRight = initialPaddingRight;
      };
    }
  }, [open]);

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
            onClick={() => onOpenChange(false)}
            text={cancelText}
          />
          <Button
            type="delete"
            onClick={() => {
              onConfirmDiscard();
              onOpenChange(false);
            }}
            text={confirmText}
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

