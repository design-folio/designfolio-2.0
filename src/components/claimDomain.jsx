import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import * as Yup from "yup";
import { useUsernameAvailability } from "@/hooks/useUsernameAvailability";

const DomainValidationSchema = Yup.object().shape({
    domain: Yup.string()
        .matches(
            /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9](?:\.[a-z]{2,})?$/,
            "Invalid subdomain"
        )
        .required("Domain is required"),
});

export default function ClaimDomain({
    form = "default",
    className = "",
    onClaimWebsite,
}) {
    const [inputValue, setInputValue] = useState("");
    const [formatError, setFormatError] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [currentNameIndex, setCurrentNameIndex] = useState(0);
    // Only check availability when format is valid
    const { isChecking: loading, isAvailable, error: apiError } = useUsernameAvailability(formatError ? "" : inputValue);
    const error = formatError || apiError;
    const router = useRouter();

    const names = ["john", "sarah", "alex", "emma", "david"];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentNameIndex(prev => (prev + 1) % names.length);
        }, 2000);
        return () => clearInterval(interval);
    }, [names.length]);

    useEffect(() => {
        router.prefetch("/signup");
    }, [router]);

    const handleClaim = () => {
        router.push({
            pathname: "/signup",
            query: { username: inputValue.toLowerCase() },
        });
    };

    const handleInputChange = (e) => {
        const pattern = /^[a-z0-9-\s]+$/;
        const newValue = e.target.value
            .toLowerCase()
            .split("")
            .filter((char) => pattern.test(char))
            .join("");
        const formattedValue = newValue.replace(/\s+/g, "-");
        setInputValue(formattedValue);

        if (!formattedValue) {
            setFormatError("");
            return;
        }
        try {
            DomainValidationSchema.validateSync({ domain: formattedValue });
            setFormatError("");
        } catch (validationError) {
            setFormatError(validationError.message);
        }
    };

    const getBorderColor = () => {
        if (error && inputValue) return "border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.12)]";
        if (!error && inputValue && isAvailable && !loading) return "border-green-500 shadow-[0_0_0_4px_rgba(34,197,94,0.12)]";
        return "border-border hover:border-foreground/20 focus-within:border-foreground/30 focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)]";
    };

    const getTextColor = () => {
        if (error && inputValue && !loading) return "text-red-500";
        if (!error && inputValue && isAvailable && !loading) return "text-green-600";
        return "text-foreground";
    };

    const handleSubmit = () => {
        if (!inputValue.trim() || error || !isAvailable || loading) return;

        if (onClaimWebsite) {
            onClaimWebsite({ domain: inputValue });
        } else {
            handleClaim();
        }
    };

    const canSubmit = !error && inputValue && isAvailable && !loading;

    if (form === "landing") {
        return (
            <div className={`w-full flex flex-col items-center gap-2.5 ${className}`}>
                <div className="w-full flex items-stretch gap-2">
                    {/* Domain input pill */}
                    <div className="flex-1 flex items-center rounded-full border border-lp-text/[0.12] bg-white dark:bg-card overflow-hidden transition-all duration-200 focus-within:border-lp-text/30 focus-within:shadow-[0_0_0_3px_rgba(29,27,26,0.07)] dark:focus-within:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]">
                        <div className="relative flex-1 min-w-0">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={handleInputChange}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                placeholder={isFocused ? "yourname" : ""}
                                autoComplete="off"
                                className="w-full bg-transparent pl-5 pr-1 py-3.5 text-[15px] font-semibold text-[--lp-text] placeholder:text-lp-text/45 outline-none appearance-none border-0 ring-0 focus:ring-0 focus:outline-none [box-shadow:none]"
                            />
                            {!inputValue && !isFocused && (
                                <motion.span
                                    key={currentNameIndex}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    className="absolute left-5 top-0 h-full flex items-center pointer-events-none text-[15px] font-semibold text-lp-text/45"
                                >
                                    {names[currentNameIndex]}
                                </motion.span>
                            )}
                        </div>
                        <span
                            className="flex items-center pl-3 pr-5 text-[14px] font-medium text-lp-text/35 whitespace-nowrap select-none border-l border-lp-text/10"
                        >
                            .designfolio.me
                        </span>
                    </div>

                    {/* Get started button */}
                    <motion.button
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        whileTap={canSubmit ? { y: 2 } : {}}
                        transition={{ type: "spring", stiffness: 600, damping: 30 }}
                        className="flex-shrink-0 rounded-full text-white px-6 py-3.5 text-[14px] font-semibold whitespace-nowrap select-none transition-opacity duration-200"
                        style={{
                            background: "linear-gradient(to bottom, #FF6E52 0%, #E8391E 100%)",
                            boxShadow: canSubmit
                                ? "0 3px 0 #b82e16, 0 6px 18px rgba(232,57,30,0.32), inset 0 1px 0 rgba(255,255,255,0.22)"
                                : "none",
                            opacity: canSubmit ? 1 : 0.5,
                            cursor: canSubmit ? "pointer" : "not-allowed",
                        }}
                        onMouseEnter={(e) => {
                            if (!canSubmit) return;
                            e.currentTarget.style.boxShadow = "0 3px 0 #b82e16, 0 8px 22px rgba(232,57,30,0.42), inset 0 1px 0 rgba(255,255,255,0.22)";
                        }}
                        onMouseLeave={(e) => {
                            if (!canSubmit) return;
                            e.currentTarget.style.boxShadow = "0 3px 0 #b82e16, 0 6px 18px rgba(232,57,30,0.32), inset 0 1px 0 rgba(255,255,255,0.22)";
                        }}
                        onMouseDown={(e) => {
                            if (!canSubmit) return;
                            e.currentTarget.style.boxShadow = "0 1px 0 #b82e16, 0 3px 10px rgba(232,57,30,0.25), inset 0 1px 0 rgba(255,255,255,0.22)";
                        }}
                        onMouseUp={(e) => {
                            if (!canSubmit) return;
                            e.currentTarget.style.boxShadow = "0 3px 0 #b82e16, 0 6px 18px rgba(232,57,30,0.32), inset 0 1px 0 rgba(255,255,255,0.22)";
                        }}
                    >
                        Get started
                    </motion.button>
                </div>

                {/* Status line */}
                <div className="h-5 flex items-center justify-center">
                    {loading && inputValue && (
                        <span className="text-[12px] text-lp-text/55 font-medium">Checking availability…</span>
                    )}
                    {!loading && error && inputValue && (
                        <span className="text-[12px] text-red-500 font-medium">{error}</span>
                    )}
                    {!loading && !error && isAvailable && inputValue && (
                        <span className="text-[12px] text-green-600 font-medium">It&apos;s available — claim it now.</span>
                    )}
                    {!inputValue && (
                        <span className="text-[12px] text-lp-text/55 font-medium">
                            Claim your domain before it&apos;s taken
                        </span>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col sm:flex-row items-stretch justify-center gap-3 max-w-2xl mx-auto pt-4 ${className}`}>
            <div className="relative w-full sm:flex-1">
                <div
                    className={`flex items-center bg-white dark:bg-white border-2 rounded-full w-full transition-all duration-300 ease-out cursor-text overflow-hidden ${getBorderColor()}`}
                >
                    <div className="relative flex-1 h-12 sm:h-14">
                        <Input
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder={isFocused && !inputValue ? "username" : ""}
                            autoComplete="off"
                            className={`border-0 bg-transparent h-full w-full px-5 sm:px-6 focus-visible:ring-0 focus-visible:ring-offset-0 !text-lg placeholder:!text-lg placeholder:text-muted-foreground/60 relative z-10 ${getTextColor()}`}
                            data-testid="input-name-footer"

                        />
                        {!inputValue && !isFocused && (
                            <motion.span
                                key={currentNameIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="absolute left-5 sm:left-6 top-0 h-full flex items-center pointer-events-none text-lg text-muted-foreground/60 "
                            >
                                {names[currentNameIndex]}
                            </motion.span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 pr-5 sm:pr-6">
                        <span className="text-base sm:text-lg text-muted-foreground/60 whitespace-nowrap">
                            .designfolio.me
                        </span>
                        {loading && inputValue && (
                            <svg
                                className="animate-spin h-4 w-4 text-muted-foreground"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V2.5A9.5 9.5 0 002.5 12H4z"
                                ></path>
                            </svg>
                        )}
                    </div>
                </div>

                {/* Status Messages */}
                <div className="h-6 text-center mt-2">
                    <div className="flex flex-col justify-center overflow-hidden">
                        {/* Default message */}
                        <div
                            className={`transition flex gap-x-1 justify-center items-center duration-300 ${!inputValue || loading
                                ? "h-max animate-slide-up max-h-10 opacity-100"
                                : "h-max max-h-0 opacity-0"
                                }`}
                        >
                            <span className="text-sm text-muted-foreground font-medium">
                                Claim your domain before it's late!
                            </span>
                        </div>

                        {/* Success message */}
                        <div
                            className={`transition-transform flex gap-x-1 justify-center items-center duration-300 ${!error && inputValue && isAvailable && !loading
                                ? "-translate-y-full h-max animate-slide-down max-h-10 opacity-100"
                                : "-translate-y-full h-max max-h-0 opacity-0"
                                }`}
                        >
                            <span className="text-sm text-green-600 font-medium">
                                It's available, claim it now.
                            </span>
                        </div>

                        {/* Error message */}
                        <div
                            className={`transition-transform flex gap-x-1 justify-center items-center duration-300 ${error && inputValue && !loading
                                ? "translate-y-full h-max animate-slide-up max-h-10 opacity-100"
                                : "translate-y-full h-max max-h-0 opacity-0"
                                }`}
                        >

                            <p className="text-center flex text-input-error-color font-sm font-medium">
                                Domain is already taken.{" "}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Button
                variant="tertiary"
                onClick={handleSubmit}
                disabled={!(!error && inputValue && isAvailable && !loading)}
                className="rounded-full h-14 sm:h-16 px-8 sm:px-10 text-base sm:text-lg font-semibold no-default-hover-elevate no-default-active-elevate transition-colors w-full sm:w-auto whitespace-nowrap disabled:opacity-100 disabled:bg-[#FF8675] disabled:!cursor-not-allowed"
                data-testid="button-start-building-footer"
            >
                Get started for free
            </Button>
        </div>
    );
}