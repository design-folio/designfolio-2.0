import "@/styles/tw-animate.css";
import "@/styles/globals.scss";
import "@/styles/tiptap.css";
import "@/styles/theme.css";
import localFont from "next/font/local";
import {
  Inter,
  Kalam,
  Cedarville_Cursive,
  Pixelify_Sans,
  JetBrains_Mono,
  Manrope,
  Caveat,
} from "next/font/google";
import Header from "@/components/header";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import App from "next/app";
import { ThemeProvider } from "next-themes";
import { GlobalProvider, useGlobalContext } from "@/context/globalContext";
// import queryClient from "@/network/queryClient";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { HydrationBoundary, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import queryClient from "@/network/queryClient";
import Head from "next/head";
import UpgradeModal from "@/components/upgradeModal";
import SettingsModal from "@/components/SettingsModal";
import { BuilderSideNav } from "@/components/BuilderSideNav";
import { BuilderTopNav } from "@/components/BuilderTopNav";
import { FloatingPageContainer } from "@/components/FloatingPageContainer";
import { BlindersTransition } from "@/components/BlindersTransition";
import { UpgradePill } from "@/components/loggedInHeader/navbar/UpgradePill";
import { CursorTooltipProvider } from "@/context/cursorTooltipContext";
import { CursorPill } from "@/components/CursorPill";
import { TEMPLATE_IDS } from "@/lib/templates";
import posthog, { initPostHog } from "@/lib/postHog";
import { GoogleAnalytics } from "@next/third-parties/google";
import { PostHogProvider } from "@posthog/react";
import { usePostHogEvent } from "@/hooks/usePostHogEvent";
import { POSTHOG_EVENT_NAMES } from "@/lib/posthogEventNames";
import { DM_Mono } from "next/font/google";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  weight: ["400", "500", "600", "700"],
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-dm-mono",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

const kalam = Kalam({
  subsets: ["latin"],
  variable: "--font-kalam",
  weight: ["400", "700"],
});

const cedarvilleCursive = Cedarville_Cursive({
  subsets: ["latin"],
  variable: "--font-cedarville",
  weight: ["400"],
  preload: false, // only used in Mono template project footer
});

const pixelifySans = Pixelify_Sans({
  subsets: ["latin"],
  variable: "--font-pixelify",
  weight: ["400", "500", "600", "700"],
  preload: false, // only used in Professional template
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500", "600", "700"],
});

const satoshi = localFont({
  display: "swap",
  src: [
    {
      path: "./fonts/satoshi/Satoshi-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/satoshi/Satoshi-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/satoshi/Satoshi-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/sf-pro/SF-Pro-Text-BoldItalic.otf",
      weight: "700",
      style: "italic",
    },
    {
      path: "./fonts/satoshi/Satoshi-Black.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-satoshi",
});

const sfpro = localFont({
  display: "swap",
  src: [
    {
      path: "./fonts/sf-pro/SF-Pro-Text-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/sf-pro/SF-Pro-Text-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/sf-pro/SF-Pro-Text-Semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/sf-pro/SF-Pro-Text-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sfpro",
});
const gsans = localFont({
  display: "swap",
  src: [
    {
      path: "./fonts/general-sans/GeneralSans-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/general-sans/GeneralSans-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/general-sans/GeneralSans-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/general-sans/GeneralSans-Semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/general-sans/GeneralSans-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-gsans",
});

const eudoxus = localFont({
  display: "swap",
  src: [
    {
      path: "./fonts/exodus/EudoxusSans-Bold.ttf",
      weight: "400",
      style: "normal",
    },

    {
      path: "./fonts/exodus/EudoxusSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-eudoxus",
});

// Manages html.sidebar-layout class so the 8px gap areas match the sidebar chrome color.
// Must live inside GlobalProvider to read template via useGlobalContext.
function ShellClassManager({ isSidebarRoute }) {
  const { template } = useGlobalContext();
  const router = useRouter();

  useEffect(() => {
    const isRetroOsBuilder = router.pathname === "/builder" && template === TEMPLATE_IDS.RETRO_OS;
    document.documentElement.classList.toggle(
      "sidebar-layout",
      isSidebarRoute && !isRetroOsBuilder
    );
  }, [isSidebarRoute, template, router.pathname]);

  return null;
}

// Renders the top Header, hiding it on desktop for sidebar routes (except RETRO_OS on /builder).
function ConditionalHeader({ dfToken, hideHeader, isSidebarRoute }) {
  const { template } = useGlobalContext();
  const router = useRouter();
  const isRetroOsBuilder = router.pathname === "/builder" && template === TEMPLATE_IDS.RETRO_OS;
  const hideOnDesktop = isSidebarRoute && !isRetroOsBuilder;
  return (
    <div className={hideOnDesktop ? "md:hidden" : ""}>
      <Header dfToken={dfToken} hideHeader={hideHeader} />
    </div>
  );
}

const LANDING_PAGES = new Set([
  "/",
  "/login",
  "/signup",
  "/claim-link",
  "/resume-signup",
  "/email-verify",
  "/privacy-policy",
  "/terms-and-conditions",
  "/refund-policy",
  "/forgot-password",
  "/reset-password",
  "/oldlanding2",
]);

function MyApp({ Component, pageProps, dfToken, hideHeader }) {
  const phEvent = usePostHogEvent();
  const router = useRouter();

  const isSidebarRoute =
    !!dfToken &&
    (router.pathname === "/builder" ||
      router.pathname === "/jobs" ||
      router.pathname.startsWith("/jobs/") ||
      router.pathname === "/analytics" ||
      router.pathname === "/settings" ||
      router.pathname === "/project/[id]/editor");

  const showBuilderTopNav =
    !!dfToken &&
    (router.pathname === "/builder" ||
      router.pathname === "/settings" ||
      router.pathname === "/analytics") &&
    router.query?.view !== "ai-tools";

  // Stamp data-page="landing" on <html> for landing/auth/legal pages
  // so landing.css token overrides take effect.
  useEffect(() => {
    const isLanding = LANDING_PAGES.has(router.pathname);
    if (isLanding) {
      document.documentElement.dataset.page = "landing";
    } else {
      delete document.documentElement.dataset.page;
    }
  }, [router.pathname]);

  useEffect(() => {
    const sessionCount = Number(localStorage.getItem("session_count") || "0");
    const newSessionCount = sessionCount + 1;
    phEvent(POSTHOG_EVENT_NAMES.SESSION_STARTED, {
      session_number: newSessionCount,
      logged_in: !!dfToken,
      session_path: window.location.pathname,
      referrer: document.referrer,
    });
    // if (newSessionCount === 2) {
    //   phEvent(POSTHOG_EVENT_NAMES.SECOND_SESSION_STARTED, {
    //     logged_in: !!dfToken,
    //     session_path: window.location.pathname,
    //     referrer: document.referrer,
    //   });
    // }
    localStorage.setItem("session_count", newSessionCount);
  }, [dfToken, phEvent]);

  useEffect(() => {
    const run = () => initPostHog();
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      requestIdleCallback(run);
    } else {
      setTimeout(run, 0);
    }
  }, []);

  return (
    <>
      <GoogleAnalytics gaId="G-QBX45FVX2Z" strategy="lazyOnload" />

      <PostHogProvider client={posthog}>
        <QueryClientProvider client={queryClient}>
          <HydrationBoundary state={pageProps.dehydratedState}>
            <ThemeProvider
              enableSystem={false}
              attribute="data-theme"
              defaultTheme="light"
              themes={["light", "dark"]}
              forcedTheme={Component.theme || (router.query?.view === "ai-tools" ? "light" : null)}
            >
              <style jsx global>{`
                :root {
                  font-family: ${inter.style.fontFamily};
                }
              `}</style>
              <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <GlobalProvider>
                  <CursorTooltipProvider>
                    <CursorPill />
                    <ShellClassManager isSidebarRoute={isSidebarRoute} />
                    <main
                      className={`${satoshi.variable} ${sfpro.variable} ${inter.variable} ${kalam.variable} ${gsans.variable} ${eudoxus.variable} ${dmMono.variable} ${cedarvilleCursive.variable} ${pixelifySans.variable} ${jetbrainsMono.variable} ${manrope.variable} ${caveat.variable}`}
                    >
                      <ConditionalHeader
                        dfToken={dfToken}
                        hideHeader={pageProps?.hideHeader}
                        isSidebarRoute={isSidebarRoute}
                      />
                      {isSidebarRoute && <BuilderSideNav />}
                      {showBuilderTopNav && <BuilderTopNav />}
                      {isSidebarRoute && router.pathname !== "/project/[id]/editor" && (
                        <UpgradePill />
                      )}
                      <FloatingPageContainer isSidebarRoute={isSidebarRoute}>
                        <BlindersTransition>
                          <Component {...pageProps} />
                        </BlindersTransition>
                      </FloatingPageContainer>
                      <ToastContainer position="bottom-right" />
                      <UpgradeModal />
                      <SettingsModal />
                    </main>
                  </CursorTooltipProvider>
                </GlobalProvider>
              </GoogleOAuthProvider>
            </ThemeProvider>
          </HydrationBoundary>
          {/* <ReactQueryDevtools initialOpen={false} position="bottom-right" /> */}
        </QueryClientProvider>
      </PostHogProvider>
    </>
  );
}

MyApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext);
  const dfToken = appContext.ctx.req
    ? appContext.ctx.req.cookies["df-token"]
    : Cookies.get("df-token");
  return { ...appProps, dfToken: !!dfToken };
};

export default MyApp;
