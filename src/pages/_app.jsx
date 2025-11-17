import "@/styles/globals.scss";
import "@/styles/tiptap.css";
import localFont from "next/font/local";
import { Inter, Kalam } from "next/font/google";
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
import queryClient from "@/network/queryClient";
import Head from "next/head";
import UpgradeModal from "@/components/upgradeModal";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

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
  ],
  variable: "--font-sfpro",
});
const gsans = localFont({
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

function MyApp({ Component, pageProps, dfToken, hideHeader }) {
  const { theme } = useTheme();

  return (
    <>
      <Head>
        {/* Google Analytics Script */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-QBX45FVX2Z"
        ></script>
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-QBX45FVX2Z');
          `}
        </script>
      </Head>
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
                  className={`${satoshi.variable} ${sfpro.variable} ${inter.variable} ${kalam.variable} ${gsans.variable} `}
                >
                  {<Header
                    dfToken={dfToken}
                    hideHeader={pageProps?.hideHeader}
                  />}
                  <Component {...pageProps} />
                  <ToastContainer position="bottom-right" />
                  <UpgradeModal />
                </main>
              </GlobalProvider>
            </GoogleOAuthProvider>
          </ThemeProvider>
        </HydrationBoundary>
        {/* <ReactQueryDevtools initialOpen={false} position="bottom-right" /> */}
      </QueryClientProvider>
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
