import { _getUserDetails } from "@/network/get-request";
import { _updateUser } from "@/network/post-request";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useTheme } from "next-themes";
import React, { createContext, useState, useContext, useEffect } from "react";

// Create a new context instance
const GlobalContext = createContext();

// Custom hook to use the GlobalContext
export const useGlobalContext = () => {
  return useContext(GlobalContext);
};

// Provider component to wrap your app and provide the context
export const GlobalProvider = ({ children }) => {
  const [popoverMenu, setPopoverMenu] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [isUserDetailsFromCache, setIsUserDetailsFromCache] = useState(false);
  const { setTheme } = useTheme();

  // Fetch user details
  const {
    data,
    isLoading,
    error,
    isStale: userDetailsIsState,
    refetch: userDetailsRefecth,
  } = useQuery({
    queryKey: ["userDetails"],
    queryFn: async () => {
      const response = await _getUserDetails(); // Adjust the endpoint
      return response.data;
    },
    enabled: !!Cookies.get("df-token") && isUserDetailsFromCache,
    cacheTime: 300000, // Cache for 5 minutes (300,000 milliseconds)
    staleTime: 60000, // Allow data to be considered stale after 1 minute (60,000 milliseconds)
  });

  useEffect(() => {
    if (data && !userDetailsIsState) {
      setTheme(data?.user?.theme == 1 ? "dark" : "light");
      setUserDetails(data?.user);
      setIsUserDetailsFromCache(true);
    }
  }, [data, setTheme, userDetailsIsState]);

  const changeTheme = (theme) => {
    _updateUser({ theme: theme }).then((res) => {
      setTheme(theme == 1 ? "dark" : "light");
      setUserDetails(() => ({ ...userDetails, theme: theme }));
    });
  };

  return (
    <GlobalContext.Provider
      value={{
        popoverMenu,
        setPopoverMenu,
        userDetailLoading: isLoading,
        userDetails,
        userDetailsRefecth,
        setIsUserDetailsFromCache,
        userDetailsIsState,
        changeTheme,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
