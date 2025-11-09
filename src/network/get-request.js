import axiosInstance from "./axiosInstance";

export const _getTools = () => axiosInstance.get("/tool/get/all");
export const _getUserDetails = () => axiosInstance.get("/user/get");
export const _getProjectDetails = (id, status, body) =>
  axiosInstance.post(`/user/project?id=${id}&status=${status}`, body);

export const _getUser = (id) => axiosInstance.get(`/user/user?username=${id}`);

export const _resendOTP = () =>
  axiosInstance.get("/user/resendEmailVerification");

export const _getSkills = (search = "", personaID = "") => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (personaID) params.append("personaID", personaID);

  const queryString = params.toString();
  return axiosInstance.get(`/skill/get/all${queryString ? `?${queryString}` : ""}`);
};

export const _getPersonas = () => axiosInstance.get("persona/get/all");

export const _getProjectTypes = () => axiosInstance.get("/projectType/get/all");

export const _getCredits = (userId) =>
  axiosInstance.get("/ai/get/credits?userId=" + userId);

export const _getDomainDetails = () =>
  axiosInstance.get("/user/getCustomDomainStatus");

export const _removeDomain = () =>
  axiosInstance.delete("/user/removeCustomDomain");

export const createOrder = () => axiosInstance.get("/user/createRazorpayOrder");

export const _getProPlanDetails = () =>
  axiosInstance.get("/user/getProPlanDetails");

export const _getPaymentDetails = () => axiosInstance.get("/user/getUserOrder");
