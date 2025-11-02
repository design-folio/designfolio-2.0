import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { FormButton } from "./ui/form-button";

export default function ForgotPasswordPlaceHolder({ email, onTryAgain, onBackToLogin, isLoading, retryDelay }) {
    return (
        <motion.div
            key="reset-sent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        >
            <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Check />
                </div>
                <h1 className="font-semibold text-2xl mb-2 text-foreground" data-testid="text-reset-sent-headline">
                    Check your email
                </h1>
                <p className="text-sm text-foreground/60" data-testid="text-reset-sent-description">
                    We've sent password reset instructions to <strong>{email}</strong>
                </p>
            </div>

            <div className="space-y-4">
                <p className="text-sm text-foreground/70 text-center">
                    Didn't receive the email? Check your spam folder or{" "}
                    <button
                        type="button"
                        onClick={onTryAgain}
                        disabled={isLoading || retryDelay > 0}
                        className="font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ color: '#FF553E' }}
                        data-testid="link-try-again"
                    >
                        {isLoading
                            ? 'Sending...'
                            : retryDelay > 0
                                ? `try again (${retryDelay}s)`
                                : 'try again'
                        }
                    </button>
                </p>

                <FormButton
                    onClick={onBackToLogin}
                    data-testid="button-back-to-login"
                >
                    Back to login
                </FormButton>
            </div>
        </motion.div>
    );
}


