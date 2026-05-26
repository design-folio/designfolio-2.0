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
import { useGlobalContext } from "@/context/globalContext";
import { useEffect } from "react";

export default function JobsPage() {
  const { setIsUserDetailsFromCache, userDetailsIsState } = useGlobalContext();

  useEffect(() => {
    if (userDetailsIsState) {
      setIsUserDetailsFromCache(false);
    } else {
      setIsUserDetailsFromCache(true);
    }
  }, []);

  return (
    <>
      <JobsFloatingNav />
      <Jobs />
    </>
  );
}

export async function getServerSideProps(context) {
  const base = await loggedInServerSideProps(context);
  if (base.redirect || base.notFound) return base;

  return {
    props: {
      ...(base.props ?? {}),
      betaUser: true,
      hideHeader: true,
    },
  };
}
