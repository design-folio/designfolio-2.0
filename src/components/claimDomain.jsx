import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/router";
import * as Yup from "yup";
import { useUsernameAvailability } from "@/hooks/useUsernameAvailability";

const DomainValidationSchema = Yup.object().shape({
  domain: Yup.string()
    .matches(/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9](?:\.[a-z]{2,})?$/, "Invalid subdomain")
    .required("Domain is required"),
});

export default function ClaimDomain({ className = "", onClaimWebsite }) {
  const [inputValue, setInputValue] = useState("");
  const [formatError, setFormatError] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [currentNameIndex, setCurrentNameIndex] = useState(0);
  const {
    isChecking: loading,
    isAvailable,
    error: apiError,
  } = useUsernameAvailability(formatError ? "" : inputValue);
  const error = formatError || apiError;
  const router = useRouter();

  const names = ["john", "sarah", "alex", "emma", "david"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNameIndex((prev) => (prev + 1) % names.length);
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
    <div className={`flex w-full flex-col items-center gap-2.5 ${className}`}>
      <div className="flex w-full flex-col items-stretch gap-2 sm:flex-row">
        {/* Domain input pill */}
        <div className="border-lp-text/[0.12] focus-within:border-lp-text/30 dark:focus-within:border-lp-text/25 flex flex-1 items-center overflow-hidden rounded-full border bg-white transition-all duration-200 focus-within:shadow-[0_0_0_3px_rgba(29,27,26,0.07)] dark:border-(--lp-border) dark:bg-(--lp-card) dark:focus-within:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]">
          <div className="relative min-w-0 flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={isFocused ? "yourname" : ""}
              autoComplete="off"
              className="placeholder:text-lp-text/45 w-full appearance-none border-0 bg-transparent py-3.5 pr-1 pl-5 text-[15px] font-semibold text-(--lp-text) ring-0 [box-shadow:none] outline-none focus:ring-0 focus:outline-none"
            />
            {!inputValue && !isFocused && (
              <motion.span
                key={currentNameIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="text-lp-text/45 pointer-events-none absolute top-0 left-5 flex h-full items-center text-[15px] font-semibold"
              >
                {names[currentNameIndex]}
              </motion.span>
            )}
          </div>
          <div className="border-lp-text/[0.08] flex items-center gap-2 border-l pr-5 pl-3 dark:border-(--lp-border)">
            <span className="text-lp-text/35 text-[14px] font-medium whitespace-nowrap select-none">
              .designfolio.me
            </span>
            {loading && inputValue && (
              <Spinner variant="circle" className="text-lp-text/40 h-3.5 w-3.5" />
            )}
          </div>
        </div>

        {/* Get started button */}
        <motion.button
          onClick={handleSubmit}
          disabled={!canSubmit}
          whileTap={canSubmit ? { y: 2 } : {}}
          transition={{ type: "spring", stiffness: 600, damping: 30 }}
          className="w-full shrink-0 rounded-full px-6 py-3.5 text-[14px] font-semibold whitespace-nowrap text-white transition-opacity duration-200 select-none sm:w-auto"
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
            e.currentTarget.style.boxShadow =
              "0 3px 0 #b82e16, 0 8px 22px rgba(232,57,30,0.42), inset 0 1px 0 rgba(255,255,255,0.22)";
          }}
          onMouseLeave={(e) => {
            if (!canSubmit) return;
            e.currentTarget.style.boxShadow =
              "0 3px 0 #b82e16, 0 6px 18px rgba(232,57,30,0.32), inset 0 1px 0 rgba(255,255,255,0.22)";
          }}
          onMouseDown={(e) => {
            if (!canSubmit) return;
            e.currentTarget.style.boxShadow =
              "0 1px 0 #b82e16, 0 3px 10px rgba(232,57,30,0.25), inset 0 1px 0 rgba(255,255,255,0.22)";
          }}
          onMouseUp={(e) => {
            if (!canSubmit) return;
            e.currentTarget.style.boxShadow =
              "0 3px 0 #b82e16, 0 6px 18px rgba(232,57,30,0.32), inset 0 1px 0 rgba(255,255,255,0.22)";
          }}
        >
          Get started
        </motion.button>
      </div>

      {/* Status line */}
      <div className="flex h-5 items-center justify-center">
        {!loading && error && inputValue && (
          <span className="text-[12px] font-medium text-red-500 dark:text-red-400">{error}</span>
        )}
        {!loading && !error && isAvailable && inputValue && (
          <span className="text-[12px] font-medium text-green-600 dark:text-green-500">
            It&apos;s available — claim it now.
          </span>
        )}
        {!inputValue && (
          <span className="text-lp-text/55 text-[12px] font-medium">
            Claim your domain before it&apos;s taken
          </span>
        )}
      </div>
    </div>
  );
}
