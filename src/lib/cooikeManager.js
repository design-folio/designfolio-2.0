import Cookies from "js-cookie";

export const setToken = (token) => {
  // Assuming 'token' is already defined somewhere in your code.
  // Modify the cookie options based on the environment.
  const cookieOptions = {
    expires: 7,
    domain: process.env.NEXT_PUBLIC_BASE_DOMAIN,
  };
  // Check if the code is running in production.
  // This checks if the hostname includes 'designfolio.me', adjust as needed for your production domain.
  Cookies.set("df-token", token, cookieOptions);
};
