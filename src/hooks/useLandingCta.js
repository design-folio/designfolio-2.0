import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";

export function useLandingCta({ dfToken, hasParsedResume, onShowUploadModal }) {
  const router = useRouter();

  const ctaLabel = dfToken ? "Launch Builder" : hasParsedResume ? "Continue Signup" : "Get Started";
  const ctaDest = dfToken ? "/builder" : hasParsedResume ? "/resume-signup" : null;

  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (ctaDest) router.prefetch(ctaDest);
  }, [ctaDest, router]);

  useEffect(() => {
    if (!ctaDest) return;
    const matches = (url) =>
      url === ctaDest || url.startsWith(`${ctaDest}?`) || url.startsWith(`${ctaDest}/`);
    const onStart = (url) => {
      if (matches(url)) setIsNavigating(true);
    };
    const onDone = () => setIsNavigating(false);
    router.events.on("routeChangeStart", onStart);
    router.events.on("routeChangeComplete", onDone);
    router.events.on("routeChangeError", onDone);
    return () => {
      router.events.off("routeChangeStart", onStart);
      router.events.off("routeChangeComplete", onDone);
      router.events.off("routeChangeError", onDone);
    };
  }, [ctaDest, router.events]);

  const handleCta = useCallback(() => {
    if (dfToken) {
      router.push("/builder");
      return;
    }
    if (hasParsedResume) {
      router.push("/resume-signup");
      return;
    }
    onShowUploadModal?.();
  }, [dfToken, hasParsedResume, router, onShowUploadModal]);

  return { ctaLabel, ctaDest, handleCta, isNavigating };
}
