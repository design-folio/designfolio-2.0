import { getServerSideProps as loggedInServerSideProps } from "@/lib/loggedInServerSideProps";
import { Jobs } from "@/components/jobs/index";
import Navbar from "@/components/loggedInHeader/navbar";
// ─── BETA GATE ──────────────────────────────────────────────────────────────
// TO LAUNCH JOBS FOR ALL USERS — remove in this order:
//   1. Delete src/lib/betaEnv.js
//   2. Remove this import + the betaUser prop below
//   3. Remove the `if (!betaUser)` 404 guard below
//   4. In JobsFloatingNav.jsx — remove the isBetaUser guard
// ─────────────────────────────────────────────────────────────────────────────
import { isBetaUser } from "@/lib/betaEnv";
import { useGlobalContext } from "@/context/globalContext";
import { useEffect, startTransition } from "react";

export default function JobsPage() {
  const { setIsUserDetailsFromCache, userDetailsIsState } = useGlobalContext();

  useEffect(() => {
    startTransition(() => setIsUserDetailsFromCache(!userDetailsIsState));
  }, [userDetailsIsState, setIsUserDetailsFromCache]);

  return (
    <>
      <div className="md:hidden">
        <Navbar />
      </div>
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
