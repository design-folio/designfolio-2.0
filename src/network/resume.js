import axiosInstance from "./axiosInstance";

// POST /resume/parse — public (no auth); accepts PDF via multipart
// Returns: { name, email, bio, introduction, skills[], experience[], projects[] }
export const _postResumeParse = (file) => {
  const fd = new FormData();
  fd.append("resume", file);
  return axiosInstance.post("/resume/parse", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// POST /resume/apply — authenticated; saves parsed resume data into user's profile
export const _postResumeApply = (data) =>
  axiosInstance.post("/resume/apply", data);
