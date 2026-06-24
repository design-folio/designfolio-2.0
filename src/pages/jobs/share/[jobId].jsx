import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Head from "next/head";
import Cookies from "js-cookie";
import { AnimatePresence } from "framer-motion";

import { _getJobsCheckSaved, _postJobsAddFromShare, _getJobsJobScore } from "@/network/jobs";
import { ShareNav } from "@/components/jobs/share/ShareNav";
import { SharerBadge } from "@/components/jobs/share/SharerBadge";
import { JobHeroCard } from "@/components/jobs/share/JobHeroCard";
import { JobDescriptionCard } from "@/components/jobs/share/JobContentCards";
import { BoostCard, CTASkeleton } from "@/components/jobs/share/BoostCard";
import { ScoreModal } from "@/components/jobs/share/ScoreModal";

const SCORE_POLL_INTERVAL_MS = 2500;
const SCORE_POLL_MAX_ATTEMPTS = 8; // ~20s total

export default function SharedJobPage({ job, sharer, sharerUsername }) {
  // "loading" | "new" | "loggedin" | "saved"
  const [authState, setAuthState] = useState("loading");
  const [isSaving, setIsSaving] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [matchScore, setMatchScore] = useState(null);
  const scorePollRef = useRef(null);

  // Canvas theme
  useEffect(() => {
    document.documentElement.dataset.template = "canvas";
    return () => document.documentElement.removeAttribute("data-template");
  }, []);

  // isDark still needed for ScoreModal's isolated palette
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  // Cleanup score poll on unmount
  useEffect(() => () => clearInterval(scorePollRef.current), []);

  // Auth detection — lightweight single-query check instead of full history load
  useEffect(() => {
    const token = Cookies.get("df-token");
    if (!token) {
      setAuthState("new");
      return;
    }
    _getJobsCheckSaved(job.id)
      .then(({ data }) => {
        if (data?.saved) {
          setAuthState("saved");
          startScorePoll(job.id);
        } else {
          setAuthState("loggedin");
        }
      })
      .catch(() => setAuthState("loggedin"));
  }, [job.id]);

  const startScorePoll = (jobId) => {
    clearInterval(scorePollRef.current);
    let attempts = 0;
    scorePollRef.current = setInterval(async () => {
      attempts++;
      try {
        const { data } = await _getJobsJobScore(jobId);
        if (data?.match !== null && data?.match !== undefined) {
          setMatchScore(data.match);
          clearInterval(scorePollRef.current);
        }
      } catch {
        /* silent */
      }
      if (attempts >= SCORE_POLL_MAX_ATTEMPTS) clearInterval(scorePollRef.current);
    }, SCORE_POLL_INTERVAL_MS);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data } = await _postJobsAddFromShare(job.id);
      setAuthState("saved");
      if (data?.job?.match !== null && data?.job?.match !== undefined) {
        setMatchScore(data.job.match);
      } else {
        startScorePoll(job.id);
      }
    } catch {
      /* axiosInstance surfaces a toast */
    } finally {
      setIsSaving(false);
    }
  };

  const badge = <SharerBadge sharer={sharer} sharerUsername={sharerUsername} />;

  return (
    <>
      <Head>
        <title>
          {job.role} at {job.company} · Designfolio
        </title>
        <meta
          name="description"
          content={`${job.role} at ${job.company}${job.location ? ` — ${job.location}` : ""}. Track your application with Designfolio.`}
        />
      </Head>

      <div className="min-h-screen bg-background flex flex-col">
        <ShareNav authState={authState} jobId={job.id} />

        {/* pt-[70px] clears the fixed nav */}
        <main className="flex-1 max-w-5xl mx-auto w-full px-5 pt-[70px] pb-16">
          <div className="py-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_284px] gap-5 items-start">
              {/* ── Left: job content ── */}
              <div className="min-w-0 space-y-4">
                <JobHeroCard
                  job={job}
                  badge={badge}
                  authState={authState}
                  onApplyClick={() => setShowScoreModal(true)}
                />

                {/* Mobile BoostCard — shows between hero and description */}
                <div className="lg:hidden">
                  {authState === "loading" ? (
                    <CTASkeleton />
                  ) : (
                    <BoostCard
                      authState={authState}
                      isDark={isDark}
                      isSaving={isSaving}
                      matchScore={matchScore}
                      onSave={handleSave}
                      onFindScore={() => setShowScoreModal(true)}
                    />
                  )}
                </div>

                <JobDescriptionCard description={job.description} delay={0.06} />
              </div>

              {/* ── Right: sticky sidebar (desktop) ── */}
              <div className="hidden lg:block min-w-0 lg:sticky lg:top-[74px]">
                {authState === "loading" ? (
                  <CTASkeleton />
                ) : (
                  <BoostCard
                    authState={authState}
                    isDark={isDark}
                    isSaving={isSaving}
                    matchScore={matchScore}
                    onSave={handleSave}
                    onFindScore={() => setShowScoreModal(true)}
                  />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Score Modal */}
      <AnimatePresence>
        {showScoreModal && (
          <ScoreModal
            key="score-modal"
            job={job}
            isDark={isDark}
            onClose={() => setShowScoreModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Helpers (SSR only) ────────────────────────────────────────────────────────
function stripHtmlToText(raw) {
  if (!raw) return raw;
  const HTML_TAG_RE_SSR = /<(p|div|ul|ol|li|h[1-6]|br|span|a|strong)\b/i;
  if (!HTML_TAG_RE_SSR.test(raw)) return raw;
  return raw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function getServerSideProps({ params, query }) {
  const { jobId } = params;
  const { ref } = query;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  try {
    const [jobRes, sharerRes] = await Promise.all([
      axios.get(`${baseUrl}/jobs/public/${jobId}`),
      ref ? axios.get(`${baseUrl}/user/public/${ref}`).catch(() => null) : Promise.resolve(null),
    ]);

    const job = jobRes.data.job;
    if (job.description) job.description = stripHtmlToText(job.description);

    return {
      props: {
        job,
        sharer: sharerRes?.data ?? null,
        sharerUsername: ref ?? null,
        hideHeader: true,
      },
    };
  } catch {
    return { notFound: true };
  }
}
