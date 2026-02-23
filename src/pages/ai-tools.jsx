import Cookies from "js-cookie";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import AiToolsWorkspace from "@/components/AiToolsWorkspace";

/**
 * AI Tools page. Logged-in users are redirected to /builder?view=ai-tools so AI tools
 * live inside the builder (no full navigation). Guests use this page as-is.
 */
export default function Index() {
  const router = useRouter();
  const isLoggedIn = !!Cookies.get("df-token");

  useEffect(() => {
    if (!router.isReady || !isLoggedIn) return;
    const type = router.query?.type ? `&type=${router.query.type}` : "";
    router.replace(`/builder?view=ai-tools${type}`, undefined, { shallow: false });
  }, [router.isReady, isLoggedIn, router.query?.type]);

  if (isLoggedIn) {
    return null; // redirect in progress
  }

  return <AiToolsWorkspace embedInBuilder={false} />;
}

Index.theme = "light";
