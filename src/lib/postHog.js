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
