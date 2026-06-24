const BETA_EMAILS = (process.env.NEXT_PUBLIC_BETA_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isBetaUser(email) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  // Staging and local — all users are beta users
  if (baseUrl === "" || baseUrl.includes("localhost") || baseUrl.includes("stage")) return true;

  // Production — check the beta email allowlist
  if (!email) return false;
  return BETA_EMAILS.includes(email.toLowerCase());
}
