import axiosInstance from "./axiosInstance";

// Tailored documents (resume / cover letter) — job-tied, persisted, versioned.
// Backend: designfolio-backend /documents (see src/routes/documents.js)

// POST /documents/resume — generate + persist a tailored resume; returns the saved doc.
// Costs 1 resumeCustomize credit. Synchronous (~3-6s) — show a loader.
export const _postGenerateResume = (jobId, profileId) =>
  axiosInstance.post("/documents/resume", { jobId, profileId });

// POST /documents/cover-letter — generate + persist a full cover letter; returns the saved doc.
// Costs 1 coverLetter credit.
export const _postGenerateCoverLetter = (jobId, profileId) =>
  axiosInstance.post("/documents/cover-letter", { jobId, profileId });

// GET /documents — list saved docs (no content field). Optional filters: { jobId, type }.
// type: 'resume' | 'coverLetter'. Used by the per-job versions list and the global Documents area.
export const _getDocuments = (params = {}) => axiosInstance.get("/documents", { params });

// GET /documents/:id — full document including content + styling.
export const _getDocument = (id) => axiosInstance.get(`/documents/${id}`);

// PATCH /documents/:id — persist edits. payload: { content?, styling? }. Free.
export const _patchDocument = (id, payload) => axiosInstance.patch(`/documents/${id}`, payload);

// DELETE /documents/:id — Free.
export const _deleteDocument = (id) => axiosInstance.delete(`/documents/${id}`);

// POST /documents/:id/export — render PDF via the Lambda; returns { url, key }. Free.
export const _postExportDocument = (id, format = "pdf") =>
  axiosInstance.post(`/documents/${id}/export`, { format });
