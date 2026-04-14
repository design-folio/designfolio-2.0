import axiosInstance from "./axiosInstance";

// GET /jobs/questions — fetch quiz questions once on mount
export const _getJobsQuestions = () => axiosInstance.get("/jobs/questions");

// POST /jobs/recommend — submit quiz answers; returns { pipelineId, jobs[] }
// Server handles seen-job deduplication automatically — no excludeIds needed.
export const _postJobsRecommend = (answers) =>
  axiosInstance.post("/jobs/recommend", { answers });

// POST /jobs/interact — fire-and-forget pipeline tracking
// action: 'viewed' | 'applied' | 'saved' | 'dismissed' | 'interview' | 'offer'
// jobData: optional { match, reason, matchReasons, emotionalLabel } — included on first pipeline move
// onNotFound: called when the pipeline no longer exists (404) — caller should re-run /recommend
export const _postJobsInteract = (pipelineId, jobId, action, jobData = null, onNotFound = null) => {
  if (!pipelineId || !jobId) return;
  axiosInstance
    .post("/jobs/interact", {
      pipelineId,
      jobId,
      action,
      ...(jobData && {
        score:          jobData.match,
        reason:         jobData.reason,
        matchReasons:   jobData.matchReasons,
        emotionalLabel: jobData.emotionalLabel,
      }),
    })
    .catch((err) => {
      if (err?.response?.status === 404 && onNotFound) onNotFound();
    });
};

// GET /jobs/history — restore pipeline state on page mount
export const _getJobsHistory = () => axiosInstance.get("/jobs/history");

// POST /jobs/more — append more picks via infinite scroll (same pipelineId throughout)
// Server manages cursor and deduplication — no excludeIds or page offset needed.
export const _postJobsMore = (pipelineId, answers) =>
  axiosInstance.post("/jobs/more", { pipelineId, answers });

// POST /jobs/scout — Scout AI chat; returns { reply: string }
export const _postJobsScout = (pipelineId, jobId, message) =>
  axiosInstance.post("/jobs/scout", { pipelineId, jobId, message });

// POST /jobs/customize-resume — returns { customizedResume, changes[] }
export const _postJobsCustomizeResume = (jobId, pipelineId) =>
  axiosInstance.post("/jobs/customize-resume", { jobId, pipelineId });

// POST /jobs/cover-letter — returns { coverLetter: string }
export const _postJobsCoverLetter = (jobId, pipelineId) =>
  axiosInstance.post("/jobs/cover-letter", { jobId, pipelineId });

// POST /jobs/fit-analysis — returns { strengths[], gaps[], overallVerdict }
export const _postJobsFitAnalysis = (jobId, pipelineId) =>
  axiosInstance.post("/jobs/fit-analysis", { jobId, pipelineId });
