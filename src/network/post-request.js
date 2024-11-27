import axiosInstance from "./axiosInstance";

export const _checkUsername = (data) => axiosInstance.post("/user/check", data);

export const _signupEmail = (data) =>
  axiosInstance.post("/user/signup/email", data);

export const _signupGmail = (data) =>
  axiosInstance.post("/user/signup/google", data);

export const _loginWithEmail = (data) =>
  axiosInstance.post("/user/login/email", data);

export const _loginWithGmail = (data) =>
  axiosInstance.post("/user/login/google", data);

export const _forgotPassword = (data) =>
  axiosInstance.post("/user/forgotPassword", data);

export const _resetPassword = (email, otp, data) =>
  axiosInstance.post(
    `/user/resetPassword?loginMethod=0&email=${email}&passwordResetOTP=${otp}`,
    data
  );

export const _updateUser = (data) => axiosInstance.patch("/user/update", data);

export const _uploadImage = (data) =>
  axiosInstance.patch("/user/editorjs", data);

export const _updateProject = (id, data) =>
  axiosInstance.patch(`/user/project?id=${id}`, data);

export const _publish = () => axiosInstance.patch(`/user/publish`);

export const _verifyEmail = (data) =>
  axiosInstance.patch("/user/verifyEmail", data);

export const _updateUsername = (data) =>
  axiosInstance.patch("/user/changeUsername", data);

export const _deleteUser = () => axiosInstance.delete("/user/delete");

export const _changePassword = (data) =>
  axiosInstance.patch("/user/changePassword", data);

export const _deleteProject = (id) =>
  axiosInstance.delete(`/user/project?id=${id}`);

export const _deleteResume = () => axiosInstance.delete("/user/resume");

export const _deleteReview = (id) =>
  axiosInstance.delete(`/user/review?id=${id}`);

export const _deleteExperience = (id) =>
  axiosInstance.delete(`/user/experience?id=${id}`);

export const _changeEmail = (data) =>
  axiosInstance.patch("/user/changeEmail", data);

export const _FileBugfix = () => axiosInstance.patch("/user/filePopup");

export const _generateCaseStudy = (data) =>
  axiosInstance.post("/ai/generate/caseStudy", data);

export const _analyzeCaseStudy = (data) =>
  axiosInstance.post("/ai/analyze/caseStudy", data);

export const _analyzeCaseStudyStatus = (projectId) =>
  axiosInstance.get(`/analyse/get/analysisReportByProjectId?projectId=${projectId}`);


export const _analyzeCaseStudyCredits = (projectId) =>
  axiosInstance.get(`/ai/get/analyzeCredits?projectId=${projectId}`);
