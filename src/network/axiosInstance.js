import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = Cookies.get("df-token");
    if (token) {
      config.headers.Authorization = `${token}`;
    }
    return config;
  },
  (error) => {
    toast.error("Error during request: " + error.message);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Check if the error response is from the specific API endpoint and method
    console.log(error);
    if (
      error.response &&
      error.response.config.url === "/user/check" &&
      error.response.config.method === "post"
    ) {
      // Simply return the Promise rejection without showing a toast
      return Promise.reject(error);
    }
    if (error.response) {
      let errorMessage = "Error: ";
      switch (error.response.status) {
        case 400:
          errorMessage += error.response.data.error ?? "Bad Request";
          break;
        case 401:
          errorMessage += error.response.data.error ?? "Unauthorized";
          break;
        case 403:
          errorMessage += error.response.data.error ?? "Forbidden";
          break;
        case 404:
          errorMessage += error.response.data.error ?? "Not Found";
          break;
        case 500:
          errorMessage += error.response.data.error ?? "Internal Server Error";
          break;
        default:
          errorMessage += error.response.data.error ?? "Unhandled Error";
      }
      toast.error(errorMessage);
    } else if (error.request) {
      toast.error("No response received for the request");
    } else {
      toast.error("Error setting up the request: " + error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
