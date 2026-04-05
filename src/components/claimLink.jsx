import React, { useState } from "react";
import { useRouter } from "next/router";
import { useDebouncedCallback } from "use-debounce";
import { AnimatePresence, motion } from "framer-motion";
import * as Yup from "yup";
import { _checkUsername } from "@/network/post-request";
import { AuthLayout } from "@/components/ui/auth-layout";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DomainValidationSchema } from "@/lib/validationSchemas";


export default function ClaimLink() {
  const [isAvailable, setIsAvailable] = useState(false);
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleClaim = () => {
    router.push({
      pathname: "/signup",
      query: { username: domain.toLowerCase() },
    });
  };

  const handleDomainSubmit = (e) => {
    e.preventDefault();
    if (domain.trim() && isAvailable) {
      handleClaim();
    }
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
        } catch (error) {
          console.error(error);
          setIsAvailable(false);
        } finally {
          setLoading(false);
        }
      }
    },
    1000 // Delay in milliseconds
  );

  // Handle input change with validation
  const handleDomainChange = (e) => {
    const { value } = e.target;
    setLoading(true);

    // Filter allowed characters and format
    const pattern = /^[a-z0-9-\s]+$/;
    const newValue = value
      .toLowerCase()
      .split("")
      .filter((char) => pattern.test(char))
      .join("");
    const formattedValue = newValue.replace(/\s+/g, "-");

    setDomain(formattedValue);

    // Validate with Yup schema
    try {
      DomainValidationSchema.validateSync({ domain: formattedValue });
      setValidationError("");
      if (formattedValue) {
        debouncedCheckUsername(formattedValue);
      }
    } catch (validationError) {
      setValidationError(validationError.message);
      setLoading(false);
    }

    if (!formattedValue) {
      setValidationError("");
      setLoading(false);
      setIsAvailable(false);
    }
  };

  return (
    <AuthLayout
      title="First, claim your unique link"
      description="Choose your personal domain to get started"
    >
      <motion.div
        key="domain"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        <form onSubmit={handleDomainSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="domain" className="text-sm font-medium text-foreground">
              Your Domain
            </Label>
            <div className="flex h-10 w-full items-center rounded-xl border border-transparent bg-black/[0.03] dark:bg-white/[0.03] px-3.5 transition-colors focus-within:bg-transparent focus-within:ring-2 focus-within:ring-black/10 dark:focus-within:ring-white/10 focus-within:border-black/20 dark:focus-within:border-white/20">
              <input
                id="domain"
                type="text"
                placeholder="yourname"
                value={domain}
                onChange={handleDomainChange}
                required
                data-testid="input-domain"
                className="min-w-0 flex-1 bg-transparent py-1 text-sm text-foreground outline-none placeholder:text-black/30 dark:placeholder:text-white/30 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm text-foreground/40 whitespace-nowrap select-none">
                  .designfolio.me
                </span>
                {loading && domain && (
                  <svg
                    className="animate-spin h-4 w-4 text-muted-foreground"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V2.5A9.5 9.5 0 002.5 12H4z" />
                  </svg>
                )}
              </div>
            </div>
            <AnimatePresence>
              {validationError && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{validationError}</span>
                  </div>
                </motion.div>
              )}

              {domain && isAvailable && !loading && !validationError && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="w-4 h-4" />
                    <span>{domain}.designfolio.me is available!</span>
                  </div>
                </motion.div>
              )}

              {domain && !isAvailable && !loading && !validationError && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{domain}.designfolio.me is not available!</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>



          </div>



          <Button
            variant="darker"
            type="submit"
            className="w-full rounded-full h-11 px-6 text-base font-semibold no-default-hover-elevate no-default-active-elevate transition-colors"
            disabled={!domain.trim() || !isAvailable || loading || !!validationError}
            data-testid="button-claim-domain"
          >
            Continue
          </Button>

          <p className="text-center text-sm text-foreground/70 mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="hover:underline font-medium cursor-pointer"
              style={{ color: '#FF553E' }}
              data-testid="link-login"
            >
              Log in
            </Link>
          </p>
        </form>
      </motion.div>
    </AuthLayout>
  );
}