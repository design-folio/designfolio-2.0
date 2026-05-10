import { getServerSideProps as loggedInServerSideProps } from "@/lib/loggedInServerSideProps";
import { Jobs } from "@/components/jobs/index";
import { JobsFloatingNav } from "@/components/jobs/JobsFloatingNav";
// ─── BETA GATE ──────────────────────────────────────────────────────────────
// TO LAUNCH JOBS FOR ALL USERS — remove in this order:
//   1. Delete src/lib/betaEnv.js
//   2. Remove this import + the betaUser prop below
//   3. Remove the `if (!betaUser)` 404 guard below
//   4. In JobsFloatingNav.jsx — remove the isBetaUser guard
// ─────────────────────────────────────────────────────────────────────────────
import { isBetaUser } from "@/lib/betaEnv";

// Decodes email from a JWT without verifying the signature (safe for UI gating).
function getEmailFromJwt(token) {
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString()).email ?? null;
  } catch {
    return null;
  }
}

export default function JobsPage({ betaUser }) {
  return (
    <>
      <JobsFloatingNav betaUser={betaUser} />
      <Jobs />
    </>
  );
}

export async function getServerSideProps(context) {
  const base = await loggedInServerSideProps(context);
  if (base.redirect || base.notFound) return base;

  // BETA GATE — remove this block when launching Jobs for all users
  const email = getEmailFromJwt(context.req.cookies["df-token"] || "");
  if (!isBetaUser(email)) return { notFound: true };

  return {
    props: {
      ...(base.props ?? {}),
      betaUser: true,
      hideHeader: true,
    },
  };
}
