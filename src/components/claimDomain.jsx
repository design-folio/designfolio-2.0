import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { _checkUsername } from "@/network/post-request";
import { useRouter } from "next/router";
import { useDebouncedCallback } from "use-debounce";
import * as Yup from "yup";

const DomainValidationSchema = Yup.object().shape({
    domain: Yup.string()
        .matches(
            /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})?$/,
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
    const [error, setError] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [currentNameIndex, setCurrentNameIndex] = useState(0);
    const [isAvailable, setIsAvailable] = useState(false);
    const [loading, setLoading] = useState(false);
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

    // Debounced API call
    const debouncedCheckUsername = useDebouncedCallback(
        async (value) => {
            setLoading(true);
            if (value.length !== 0) {
                try {
                    const response = await _checkUsername({ username: value });
                    const isDomainAvailable = response?.data?.available ?? false;
                    setIsAvailable(isDomainAvailable);
                    if (!isDomainAvailable) {
                        setError("This domain seems to be taken already. Try something similar.");
                    } else {
                        setError("");
                    }
                } catch (error) {
                    console.error(error);
                    setError("Error checking domain availability");
                } finally {
                    setLoading(false);
                }
            }
        },
        1000 // Delay in milliseconds
    );

    // Handle input change with validation
    const handleInputChange = (e) => {
        const { value } = e.target;
        setLoading(true);

        // Filter allowed characters and format
        const pattern = /^[a-zA-Z0-9-\s]+$/;
        const newValue = value
            .split("")
            .filter((char) => pattern.test(char))
            .join("");
        const formattedValue = newValue.replace(/\s+/g, "-");

        setInputValue(formattedValue);

        // Validate with Yup schema
        try {
            DomainValidationSchema.validateSync({ domain: formattedValue });
            setError("");
            if (formattedValue) {
                debouncedCheckUsername(formattedValue);
            }
        } catch (validationError) {
            setError(validationError.message);
            setLoading(false);
        }

        if (!formattedValue) {
            setError("");
            setLoading(false);
            setIsAvailable(false);
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
        if (!inputValue.trim()) {
            setError("Username is required");
            return;
        }

        if (error || !isAvailable) {
            return;
        }

        if (onClaimWebsite) {
            onClaimWebsite({ domain: inputValue });
        } else {
            handleClaim();
        }
    };

    return (
        <div className={`flex flex-col sm:flex-row items-stretch justify-center gap-3 max-w-2xl mx-auto pt-4 ${className}`}>
            <div className="relative w-full sm:flex-1">
                <div
                    className={`flex items-center bg-white dark:bg-white border-2 rounded-full w-full transition-all duration-300 ease-out cursor-text overflow-hidden ${getBorderColor()}`}
                >
                    <div className="relative flex-1 h-14 sm:h-16">
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
                                className="absolute left-5 sm:left-6 top-0 h-full flex items-center pointer-events-none text-lg text-foreground"
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
                            <span className="text-sm text-red-500 font-medium">
                                {error}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <Button
                onClick={handleSubmit}
                disabled={!(!error && inputValue && isAvailable && !loading)}
                className="text-white rounded-full h-14 sm:h-16 px-8 sm:px-10 text-base sm:text-lg font-semibold no-default-hover-elevate no-default-active-elevate transition-colors w-full sm:w-auto whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#FF553E", borderColor: "#FF553E" }}
                onMouseEnter={e =>
                    !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = "#E64935")
                }
                onMouseLeave={e =>
                    !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = "#FF553E")
                }
                data-testid="button-start-building-footer"
            >
                Get started for free
            </Button>
        </div>
    );
}