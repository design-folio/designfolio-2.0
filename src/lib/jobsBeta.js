const BETA_EMAILS = (process.env.NEXT_PUBLIC_JOBS_BETA_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isJobsBetaUser(email) {
  if (!email) return false;
  if (BETA_EMAILS.length === 0) return false;
  return BETA_EMAILS.includes(email.toLowerCase());
}
