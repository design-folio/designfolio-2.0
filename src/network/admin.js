import Cookies from "js-cookie";
import axiosInstance from "./axiosInstance";

// All admin API calls use the regular df-token via axiosInstance.
// adminAuth middleware on the backend verifies df-token + isAdmin === true.

export const _getAdminMe = () => axiosInstance.get("/admin/me");
export const _getAdminStats = () => axiosInstance.get("/admin/stats");
export const _getAdminUsers = (params) =>
  axiosInstance.get("/admin/users", { params });
export const _grantPlan = (data) => axiosInstance.post("/admin/grant-plan", data);

export const clearDfToken = () => {
  Cookies.remove("df-token", { domain: process.env.NEXT_PUBLIC_BASE_DOMAIN });
};
