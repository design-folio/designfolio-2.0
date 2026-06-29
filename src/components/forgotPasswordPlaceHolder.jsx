import React from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { FormButton } from "./ui/form-button";

export default function ForgotPasswordPlaceHolder({
  email,
  onTryAgain,
  onBackToLogin,
  isLoading,
  retryDelay,
}) {
  return (
    <motion.div
      key="reset-sent"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Check />
        </div>
        <h1
          className="text-foreground mb-2 text-2xl font-semibold"
          data-testid="text-reset-sent-headline"
        >
          Check your email
        </h1>
        <p className="text-foreground/60 text-sm" data-testid="text-reset-sent-description">
          We&apos;ve sent password reset instructions to <strong>{email}</strong>
        </p>
      </div>

      <div className="space-y-4">
        <p className="text-foreground/70 text-center text-sm">
          Didn&apos;t receive the email? Check your spam folder or{" "}
          <button
            type="button"
            onClick={onTryAgain}
            disabled={isLoading || retryDelay > 0}
            className="font-medium hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            style={{ color: "#FF553E" }}
            data-testid="link-try-again"
          >
            {isLoading ? "Sending..." : retryDelay > 0 ? `try again (${retryDelay}s)` : "try again"}
          </button>
        </p>

        <FormButton onClick={onBackToLogin} data-testid="button-back-to-login">
          Back to login
        </FormButton>
      </div>
    </motion.div>
  );
}
