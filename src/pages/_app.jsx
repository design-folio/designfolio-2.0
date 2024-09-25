import "@/styles/globals.scss";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import Header from "@/components/header";
import Cookies from "js-cookie";
import App from "next/app";
import { ThemeProvider, useTheme } from "next-themes";
import { GlobalProvider } from "@/context/globalContext";
// import queryClient from "@/network/queryClient";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { HydrationBoundary, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";
import queryClient from "@/network/queryClient";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const satoshi = localFont({
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
    {
      path: "./fonts/sf-pro/SF-Pro-Text-Heavy.otf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-sfpro",
});

function MyApp({ Component, pageProps, dfToken, hideHeader }) {
  const { theme } = useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={pageProps.dehydratedState}>
        <ThemeProvider
          enableSystem={false}
          attribute="data-theme"
          forcedTheme={Component.theme || null}
          themes={theme}
        >
          <style jsx global>{`
            :root {
              font-family: ${inter.style.fontFamily};
            }
          `}</style>
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <GlobalProvider>
              <main
                className={`${satoshi.variable} ${sfpro.variable} ${inter.variable}`}
              >
                <Header dfToken={dfToken} hideHeader={pageProps?.hideHeader} />
                <Component {...pageProps} />
                <ToastContainer position="bottom-right" />
              </main>
            </GlobalProvider>
          </GoogleOAuthProvider>
        </ThemeProvider>
      </HydrationBoundary>
      <ReactQueryDevtools initialOpen={false} position="bottom-right" />
    </QueryClientProvider>
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
