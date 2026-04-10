import axiosInstance from "./axiosInstance";

// GET /jobs/questions — fetch quiz questions; call once on mount and cache
export const _getJobsQuestions = () => axiosInstance.get("/jobs/questions");

// POST /jobs/recommend — submit quiz answers; returns { recommendationId, jobs[] }
// NOTE: This call is slow (5–15 seconds) — keep ThinkingScreen visible until resolved
export const _postJobsRecommend = (answers) =>
  axiosInstance.post("/jobs/recommend", { answers });

// POST /jobs/interact — fire-and-forget tracking; action: 'viewed'|'applied'|'saved'|'dismissed'
export const _postJobsInteract = (recommendationId, jobId, action) => {
  if (!recommendationId || !jobId) return;
  axiosInstance
    .post("/jobs/interact", { recommendationId, jobId, action })
    .catch(() => {}); // intentional fire-and-forget — swallow silently
};

// GET /jobs/history — restore last recommendation session on page mount
export const _getJobsHistory = () => axiosInstance.get("/jobs/history");
