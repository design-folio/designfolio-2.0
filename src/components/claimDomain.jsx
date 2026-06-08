import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Spinner } from "@/components/ui/spinner";
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

export default function ClaimDomain({ className = "", onClaimWebsite }) {
    const [inputValue, setInputValue] = useState("");
    const [formatError, setFormatError] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [currentNameIndex, setCurrentNameIndex] = useState(0);
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

    const handleSubmit = () => {
        if (!inputValue.trim() || error || !isAvailable || loading) return;
        if (onClaimWebsite) {
            onClaimWebsite({ domain: inputValue });
        } else {
            router.push({ pathname: "/signup", query: { username: inputValue.toLowerCase() } });
        }
    };

    const canSubmit = !error && inputValue && isAvailable && !loading;

    return (
        <div className={`w-full flex flex-col items-center gap-2.5 ${className}`}>
            <div className="w-full flex items-stretch gap-2">
                {/* Domain input pill */}
                <div className="flex-1 flex items-center rounded-full border border-lp-text/[0.12] dark:border-[--lp-border] bg-white dark:bg-[--lp-card] overflow-hidden transition-all duration-200 focus-within:border-lp-text/30 dark:focus-within:border-lp-text/25 focus-within:shadow-[0_0_0_3px_rgba(29,27,26,0.07)] dark:focus-within:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]">
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
                    <div className="flex items-center gap-2 pl-3 pr-5 border-l border-lp-text/[0.08] dark:border-[--lp-border]">
                        <span className="text-[14px] font-medium text-lp-text/35 whitespace-nowrap select-none">
                            .designfolio.me
                        </span>
                        {loading && inputValue && (
                            <Spinner variant="circle" className="h-3.5 w-3.5 text-lp-text/40" />
                        )}
                    </div>
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
                {!loading && error && inputValue && (
                    <span className="text-[12px] text-red-500 dark:text-red-400 font-medium">{error}</span>
                )}
                {!loading && !error && isAvailable && inputValue && (
                    <span className="text-[12px] text-green-600 dark:text-green-500 font-medium">It&apos;s available — claim it now.</span>
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
