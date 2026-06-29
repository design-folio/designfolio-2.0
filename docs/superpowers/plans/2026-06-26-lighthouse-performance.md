# Lighthouse Performance & Best Practices Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve `/preview/[username]` Lighthouse Performance from 55→80-85 and Best Practices from 58→90 without changing UI, animations, SEO, or accessibility.

**Architecture:** Five targeted changes to the public portfolio page and its supporting infrastructure: (1) dynamic-import all template components so only the active one loads, (2) add missing security response headers, (3) defer third-party analytics scripts to after page idle, (4) add CDN cache headers to SSR responses and optimize font preloads, (5) promote the Canvas marquee animation to a compositor layer.

**Tech Stack:** Next.js 16 Pages Router, React 19, `next/dynamic`, `next/font`, `@next/third-parties/google`, `posthog-js`, Framer Motion (`motion`)

## Global Constraints

- Pages Router only — no App Router, no Server Components, no `generateMetadata`
- No test runner configured — verification is `npm run build` + dev-server spot-check
- Do NOT change any visual appearance, animation timing, or layout
- Do NOT degrade Accessibility (89) or SEO (91) scores
- Do NOT touch authenticated routes (`/builder`, `/project/[id]/editor`, etc.)
- Ignore all image optimization — images served via CloudFront CDN
- Visitor tracking stays intact — `staleTime: 0` on the React Query fetch in `preview/[id].jsx` must not change
- No Supabase or Razorpay — app uses Dodo Payments and has eliminated Supabase

---

## File Map

| File                                                    | Change                                                                                                                                                        |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/pages/preview/[id].jsx`                            | Dynamic imports for 6 templates; CDN cache header in `getServerSideProps`                                                                                     |
| `next.config.mjs`                                       | Add `headers()` function with 6 security headers + report-only CSP                                                                                            |
| `src/lib/postHog.js`                                    | Export lazy `initPostHog()` instead of top-level `posthog.init()` side effect                                                                                 |
| `src/pages/_app.jsx`                                    | Defer PostHog via `requestIdleCallback`; add `strategy="lazyOnload"` to GA; add `display:"swap"` to local fonts; add `preload:false` to 2 template-only fonts |
| `src/components/templates/Canvas/CanvasProfileCard.jsx` | Add `style={{ willChange: "transform" }}` to marquee `motion.div`                                                                                             |

---

## Task 1: Template Dynamic Imports + CDN Cache Header

**Files:**

- Modify: `src/pages/preview/[id].jsx`

**Goal:** Replace 6 static template imports with `next/dynamic`, remove dead `Template2` import, and add a `Cache-Control` header so CDN can cache the SSR HTML.

- [ ] **Step 1: Open the file and locate the import block**

  Open `src/pages/preview/[id].jsx`. The current top of the file has these static imports to remove:

  ```js
  import Minimal from "@/components/comp/Minimal";
  import MacOSTemplate from "@/components/comp/MacOSTemplate";
  import Template2 from "@/components/template2"; // dead code — remove entirely
  import Chat from "@/components/templates/Chat";
  import Canvas from "@/components/templates/Canvas";
  import Mono from "@/components/templates/Mono";
  import Professional from "@/components/templates/Professional";
  ```

- [ ] **Step 2: Replace static imports with dynamic imports**

  At the top of `src/pages/preview/[id].jsx`, add the `next/dynamic` import and replace all 7 lines above with:

  ```js
  import dynamic from "next/dynamic";

  // ssr: false — templates depend on useGlobalContext and useTheme (client-only hooks).
  // <Seo> handles all meta tags server-side independently of template rendering.
  const Canvas = dynamic(() => import("@/components/templates/Canvas"), { ssr: false });
  const Chat = dynamic(() => import("@/components/templates/Chat"), { ssr: false });
  const Minimal = dynamic(() => import("@/components/comp/Minimal"), { ssr: false });
  const Mono = dynamic(() => import("@/components/templates/Mono"), { ssr: false });
  const Professional = dynamic(() => import("@/components/templates/Professional"), { ssr: false });
  const MacOSTemplate = dynamic(() => import("@/components/comp/MacOSTemplate"), { ssr: false });
  ```

  `Template2` is not referenced anywhere in the file's JSX — do not create a dynamic import for it.

- [ ] **Step 3: Add Cache-Control header to getServerSideProps**

  In `src/pages/preview/[id].jsx`, locate `getServerSideProps`. Add one line at the top of the `try` block, before the `_getUser` call:

  ```js
  export const getServerSideProps = async (context) => {
    const { id } = context.query;
    // Allow CDN to cache the SSR HTML for 60s; serve stale for 5 min while revalidating.
    // staleTime: 0 on the client-side React Query fetch is unchanged — visitor tracking
    // still fires via _getUser on every client navigation.
    context.res.setHeader(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=300"
    );
    try {
      const userResponse = await _getUser(id);
      // ... rest of existing code unchanged
  ```

- [ ] **Step 4: Verify the build compiles cleanly**

  ```bash
  npm run build
  ```

  Expected: build completes with no errors. You will see the template chunks listed as separate JS files (e.g., `chunks/pages/...Canvas...js`). If you see "Module not found" for any template, recheck the import paths in Step 2.

- [ ] **Step 5: Spot-check in dev server**

  ```bash
  npm run dev
  ```

  Open `http://localhost:3000/preview/<any-username>`. The portfolio should render normally. Open DevTools → Network → filter by JS. You should see template chunk files loading on demand (not in the initial bundle). Confirm the `Cache-Control` header appears in the preview page's response headers (Network → Doc tab → Response Headers).

- [ ] **Step 6: Commit**

  ```bash
  git add src/pages/preview/\[id\].jsx
  git commit -m "perf: dynamic import all portfolio templates in preview page

  Replaces 6 static template imports with next/dynamic (ssr:false) so only
  the active template chunk is downloaded per visitor. Removes dead Template2
  import. Adds CDN Cache-Control header to getServerSideProps SSR response.

  Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
  ```

---

## Task 2: Security Headers

**Files:**

- Modify: `next.config.mjs`

**Goal:** Add 6 security response headers and a report-only CSP to fix the Best Practices score gap.

- [ ] **Step 1: Open next.config.mjs**

  Current file exports `nextConfig` with `sassOptions`, `turbopack`, and `webpack` keys. You will add a `headers` async function to the same object.

- [ ] **Step 2: Add the headers() function**

  In `next.config.mjs`, replace the closing of `nextConfig` with:

  ```js
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    sassOptions: {
      silenceDeprecations: ["import"],
    },
    async headers() {
      return [
        {
          source: "/(.*)",
          headers: [
            { key: "X-Frame-Options", value: "SAMEORIGIN" },
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
            { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
            {
              key: "Strict-Transport-Security",
              value: "max-age=63072000; includeSubDomains; preload",
            },
            { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
            {
              // Report-only: collects violations without blocking anything.
              // Harden to Content-Security-Policy (enforced) after reviewing reports.
              key: "Content-Security-Policy-Report-Only",
              value: [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://us.posthog.com https://app.posthog.com",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                "font-src 'self' https://fonts.gstatic.com",
                "img-src 'self' data: blob: https://*.amazonaws.com https://www.google-analytics.com",
                "connect-src 'self' https://us.posthog.com https://app.posthog.com https://www.google-analytics.com https://analytics.google.com",
                "frame-src 'self' https://pay.dodopayments.com",
                "report-uri /api/csp-report",
              ].join("; "),
            },
          ],
        },
      ];
    },
    turbopack: {
      // ... existing turbopack config unchanged
    },
    webpack: (config) => {
      // ... existing webpack config unchanged
    },
  };

  export default nextConfig;
  ```

  Keep the existing `turbopack` and `webpack` keys exactly as they are — only add the `headers` key.

- [ ] **Step 3: Verify the build compiles cleanly**

  ```bash
  npm run build
  ```

  Expected: build completes with no errors. Headers are applied at runtime — you cannot verify them in the build output.

- [ ] **Step 4: Spot-check headers in dev server**

  ```bash
  npm run dev
  ```

  Open `http://localhost:3000/preview/<any-username>`. Open DevTools → Network → click the document request → Response Headers. Confirm you see:
  - `x-frame-options: SAMEORIGIN`
  - `x-content-type-options: nosniff`
  - `referrer-policy: strict-origin-when-cross-origin`
  - `permissions-policy: camera=(), microphone=(), geolocation=()`
  - `strict-transport-security: max-age=63072000; includeSubDomains; preload`
  - `cross-origin-opener-policy: same-origin-allow-popups`
  - `content-security-policy-report-only: ...`

- [ ] **Step 5: Commit**

  ```bash
  git add next.config.mjs
  git commit -m "feat: add security response headers and report-only CSP

  Adds X-Frame-Options, X-Content-Type-Options, Referrer-Policy,
  Permissions-Policy, HSTS, and COOP to all routes. Adds a report-only
  CSP covering known domains (GA4, PostHog, CloudFront, Dodo Payments).
  Expected Best Practices gain: +25-30 pts.

  Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
  ```

---

## Task 3: PostHog Lazy Init

**Files:**

- Modify: `src/lib/postHog.js`
- Modify: `src/pages/_app.jsx`

**Goal:** Move PostHog initialization off the critical path by deferring it to browser idle time.

- [ ] **Step 1: Rewrite postHog.js to export a lazy init function**

  Replace the entire contents of `src/lib/postHog.js` with:

  ```js
  import posthog from "posthog-js";

  let _initialized = false;

  export function initPostHog() {
    if (typeof window === "undefined") return;
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    if (_initialized) return; // idempotent — safe if called more than once
    _initialized = true;
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      defaults: "2026-05-30",
    });
    posthog.register({ environment: process.env.NODE_ENV });
  }

  export default posthog;
  ```

  The default export (`posthog`) is preserved so all existing `posthog.capture()` / `usePostHogEvent()` call sites continue to work — PostHog queues calls internally until `init()` completes.

- [ ] **Step 2: Import initPostHog in \_app.jsx and defer the call**

  In `src/pages/_app.jsx`:

  1. Change the PostHog import from:

     ```js
     import posthog from "@/lib/postHog";
     ```

     to:

     ```js
     import posthog, { initPostHog } from "@/lib/postHog";
     ```

  2. In `MyApp`, add a new `useEffect` directly after the existing session-count `useEffect`. It must have an empty dependency array (runs once on mount):

     ```jsx
     useEffect(() => {
       const run = () => initPostHog();
       if (typeof window !== "undefined" && "requestIdleCallback" in window) {
         requestIdleCallback(run);
       } else {
         setTimeout(run, 0);
       }
     }, []);
     ```

- [ ] **Step 3: Verify the build compiles cleanly**

  ```bash
  npm run build
  ```

  Expected: no errors. The `posthog` default export is still consumed by `PostHogProvider` in `_app.jsx` — confirm that import is still present.

- [ ] **Step 4: Spot-check PostHog in dev**

  ```bash
  npm run dev
  ```

  Open any page. Open DevTools → Network → filter by `posthog`. You should see PostHog network requests starting only after the page is interactive (not during initial HTML parse). No PostHog errors should appear in the Console.

- [ ] **Step 5: Commit**

  ```bash
  git add src/lib/postHog.js src/pages/_app.jsx
  git commit -m "perf: defer PostHog initialization to browser idle time

  Converts top-level posthog.init() side effect to an exported initPostHog()
  called via requestIdleCallback in _app.jsx. All capture() calls queue
  internally until init completes — no analytics events lost.

  Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
  ```

---

## Task 4: GA Deferral + Font Loading Optimization

**Files:**

- Modify: `src/pages/_app.jsx`

**Goal:** Defer Google Analytics off the critical path and remove unnecessary font preload hints for two template-specific fonts.

- [ ] **Step 1: Defer Google Analytics**

  In `src/pages/_app.jsx`, locate the `<GoogleAnalytics>` render in the JSX return:

  ```jsx
  <GoogleAnalytics gaId="G-QBX45FVX2Z" />
  ```

  Replace it with:

  ```jsx
  <GoogleAnalytics gaId="G-QBX45FVX2Z" strategy="lazyOnload" />
  ```

  `lazyOnload` tells Next.js to load the GA script only after all page resources have loaded, removing it from the render-critical path. `@next/third-parties/google` forwards the `strategy` prop to the underlying `<Script>` component.

- [ ] **Step 2: Add display:"swap" to all localFont declarations**

  In `src/pages/_app.jsx`, the four `localFont()` calls (satoshi, sfpro, gsans, eudoxus) currently have no `display` option. Add `display: "swap"` to each:

  ```js
  const satoshi = localFont({
    display: "swap", // ← add this line
    src: [
      { path: "./fonts/satoshi/Satoshi-Regular.ttf", weight: "400", style: "normal" },
      { path: "./fonts/satoshi/Satoshi-Medium.ttf", weight: "500", style: "normal" },
      { path: "./fonts/satoshi/Satoshi-Bold.ttf", weight: "700", style: "normal" },
      { path: "./fonts/sf-pro/SF-Pro-Text-BoldItalic.otf", weight: "700", style: "italic" },
      { path: "./fonts/satoshi/Satoshi-Black.ttf", weight: "800", style: "normal" },
    ],
    variable: "--font-satoshi",
  });

  const sfpro = localFont({
    display: "swap", // ← add this line
    src: [
      { path: "./fonts/sf-pro/SF-Pro-Text-Regular.otf", weight: "400", style: "normal" },
      { path: "./fonts/sf-pro/SF-Pro-Text-Medium.otf", weight: "500", style: "normal" },
      { path: "./fonts/sf-pro/SF-Pro-Text-Semibold.otf", weight: "600", style: "normal" },
      { path: "./fonts/sf-pro/SF-Pro-Text-Bold.otf", weight: "700", style: "normal" },
    ],
    variable: "--font-sfpro",
  });

  const gsans = localFont({
    display: "swap", // ← add this line
    src: [
      { path: "./fonts/general-sans/GeneralSans-Light.otf", weight: "300", style: "normal" },
      { path: "./fonts/general-sans/GeneralSans-Regular.otf", weight: "400", style: "normal" },
      { path: "./fonts/general-sans/GeneralSans-Medium.otf", weight: "500", style: "normal" },
      { path: "./fonts/general-sans/GeneralSans-Semibold.otf", weight: "600", style: "normal" },
      { path: "./fonts/general-sans/GeneralSans-Bold.otf", weight: "700", style: "normal" },
    ],
    variable: "--font-gsans",
  });

  const eudoxus = localFont({
    display: "swap", // ← add this line
    src: [
      { path: "./fonts/exodus/EudoxusSans-Bold.ttf", weight: "400", style: "normal" },
      { path: "./fonts/exodus/EudoxusSans-Bold.ttf", weight: "700", style: "normal" },
    ],
    variable: "--font-eudoxus",
  });
  ```

- [ ] **Step 3: Remove preload hints for two template-only fonts**

  Still in `src/pages/_app.jsx`, add `preload: false` to `pixelifySans` and `cedarvilleCursive`. These fonts are only ever used inside dynamically-imported templates (Professional and Mono respectively) — no page needs them speculatively preloaded.

  **Do NOT add `preload: false` to Kalam** — it is used in `featuresSection.jsx` and `featuresShowcase.jsx` on the landing page.

  ```js
  const cedarvilleCursive = Cedarville_Cursive({
    subsets: ["latin"],
    variable: "--font-cedarville",
    weight: ["400"],
    preload: false, // ← add this line (only used in Mono template project footer)
  });

  const pixelifySans = Pixelify_Sans({
    subsets: ["latin"],
    variable: "--font-pixelify-sans",
    weight: ["400", "500", "600", "700"],
    preload: false, // ← add this line (only used in Professional template)
  });
  ```

- [ ] **Step 4: Verify the build compiles cleanly**

  ```bash
  npm run build
  ```

  Expected: no errors. The absence of preload hints for those two fonts will be visible in the generated HTML `<head>` at runtime, not in the build output.

- [ ] **Step 5: Spot-check fonts and GA in dev**

  ```bash
  npm run dev
  ```

  Open any page. Confirm text is still visible during font load (swap behavior). Open DevTools → Network → filter by `gtag` or `google-analytics` — GA requests should only start after the page is fully loaded. Confirm no visual regressions on `/preview/<username>`.

- [ ] **Step 6: Commit**

  ```bash
  git add src/pages/_app.jsx
  git commit -m "perf: defer GA, add font-display swap, remove template-only font preloads

  - GoogleAnalytics strategy changed to lazyOnload to defer off critical path
  - display:swap added to all four localFont declarations (satoshi, sfpro, gsans, eudoxus)
  - preload:false set on Pixelify Sans (Professional only) and Cedarville Cursive (Mono only)
  - Kalam preload left unchanged (used on landing page above the fold)

  Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
  ```

---

## Task 5: GPU-Composited Marquee Animation

**Files:**

- Modify: `src/components/templates/Canvas/CanvasProfileCard.jsx`

**Goal:** Promote the skills marquee to its own GPU compositor layer to eliminate the "non-composited animations" Lighthouse warning.

- [ ] **Step 1: Locate the marquee motion.div**

  Open `src/components/templates/Canvas/CanvasProfileCard.jsx`. Find the marquee element (around line 76):

  ```jsx
  <motion.div
    className="flex gap-4 whitespace-nowrap"
    animate={{ x: [0, "-50%"] }}
    transition={{ ease: "linear", duration: 20, repeat: Infinity }}
  >
  ```

- [ ] **Step 2: Add willChange: "transform" to the marquee**

  Add a `style` prop to promote this element to its own compositor layer before animation starts. This prevents the browser from repainting surrounding content on every frame:

  ```jsx
  <motion.div
    className="flex gap-4 whitespace-nowrap"
    style={{ willChange: "transform" }}
    animate={{ x: [0, "-50%"] }}
    transition={{ ease: "linear", duration: 20, repeat: Infinity }}
  >
  ```

  No other changes to this file.

- [ ] **Step 3: Verify the build compiles cleanly**

  ```bash
  npm run build
  ```

  Expected: no errors.

- [ ] **Step 4: Spot-check animation in dev**

  ```bash
  npm run dev
  ```

  Open a Canvas-template portfolio at `/preview/<username>`. The skills marquee should animate identically to before. Open DevTools → Rendering → check "Layer borders" — the marquee row should be highlighted as a separate layer (yellow/green border).

- [ ] **Step 5: Commit**

  ```bash
  git add src/components/templates/Canvas/CanvasProfileCard.jsx
  git commit -m "perf: promote Canvas skills marquee to GPU compositor layer

  Adds willChange:transform to the infinitely-looping x-translate motion.div
  in CanvasProfileCard. Prevents repaint of surrounding content on each frame
  and resolves the non-composited animations Lighthouse warning.

  Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
  ```

---

## Final Verification

- [ ] **Run a full production build**

  ```bash
  npm run build && npm run start
  ```

- [ ] **Run Lighthouse against the live preview page**

  Open Chrome → DevTools → Lighthouse → navigate to `/preview/<username>` → run audit in Incognito mode (to exclude extensions). Expected scores:

  | Metric         | Before | Target |
  | -------------- | ------ | ------ |
  | Performance    | 55     | 80–85  |
  | Best Practices | 58     | 88–92  |
  | Accessibility  | 89     | 89+    |
  | SEO            | 91     | 91+    |

- [ ] **Confirm no visual regressions** across at least three template types (e.g. Canvas, Professional, Mono)

---

## Known Remaining Issues (post-implementation follow-ups)

| Issue                                                            | Why deferred                                                                                                                                                 |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `max-height` transition in `MacOSDock/TestimonialWidget.jsx:177` | Classic accordion — replacing with `scaleY` risks breaking content clipping. Acceptable for now.                                                             |
| CSP report-only → enforced                                       | Requires collecting real violation reports first. Harden after production data.                                                                              |
| `App.getInitialProps` in `_app.jsx`                              | Disables static optimization globally. Removing it is a larger refactor (requires auditing all page-level `getServerSideProps`). Out of scope for this plan. |
