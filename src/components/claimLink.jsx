import React, { useState } from "react";
import { useRouter } from "next/router";
import { useDebouncedCallback } from "use-debounce";
import { AnimatePresence, motion } from "framer-motion";
import * as Yup from "yup";
import { _checkUsername } from "@/network/post-request";
import { AuthLayout } from "@/components/ui/auth-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Check } from "lucide-react";
import { FormButton } from "./ui/form-button";

const DomainValidationSchema = Yup.object().shape({
  domain: Yup.string()
    .matches(
      /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9](?:\.[a-z]{2,})?$/,
      "Invalid subdomain"
    )
    .required("Domain is required"),
});

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
            <div className="flex items-center bg-white dark:bg-white border-2 border-border rounded-full hover:border-foreground/20 focus-within:border-foreground/30 focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)] transition-all duration-300 ease-out overflow-hidden">
              <Input
                id="domain"
                type="text"
                placeholder="yourname"
                value={domain}
                onChange={handleDomainChange}
                required
                className="border-0 bg-transparent h-11 px-4 focus-visible:ring-0 focus-visible:ring-offset-0 text-base text-foreground placeholder:text-base placeholder:text-muted-foreground/60 flex-1"
                data-testid="input-domain"
              />
              <div className="flex items-center gap-2 pr-4">
                <span className="text-sm text-muted-foreground/60 whitespace-nowrap">
                  .designfolio.me
                </span>
                {loading && domain && (
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



          <FormButton
            type="submit"
            disabled={!domain.trim() || !isAvailable || loading || validationError}
            data-testid="button-claim-domain"
          >
            Continue
          </FormButton>

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