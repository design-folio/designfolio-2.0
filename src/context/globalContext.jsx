import { setCursorvalue } from "@/lib/cursor";
import { _getDomainDetails, _getUserDetails } from "@/network/get-request";
import { _updateUser } from "@/network/post-request";
import queryClient from "@/network/queryClient";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useTheme } from "next-themes";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";

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
  const [isTaskCompleted, setIsTaskCompleted] = useState(false);
  const [taskPercentage, setTaskPercentage] = useState(0);
  const [checkList, setCheckList] = useState([
    { name: "Add at least 1 Case Study", checked: false },
    { name: "Add Skills", checked: false },
    { name: "Add Experience", checked: false },
    { name: "Add Testimonials", checked: false },
  ]);
  const [showModal, setShowModal] = useState(null);
  const [step, setStep] = useState(1);
  const projectRef = useRef(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [selectedWork, setSelectedWork] = useState(null);
  const [wordCount, setWordCount] = useState(null);
  const [projectValue, setProjectValue] = useState(null);
  const [cursor, setCursor] = useState(0);
  const [template, setTemplate] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [domainDetails, setDomainDetails] = useState(null);
  const { setTheme } = useTheme();

  // Fetch user details
  const {
    data,
    isLoading,
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
    const handleClickOutside = (event) => {
      const popoverElement = document.querySelector(
        `[data-popover-id="${popoverMenu}"]`
      );

      if (popoverElement && !popoverElement.contains(event.target)) {
        setPopoverMenu(null);
      }
    };

    const handleScroll = () => {
      setPopoverMenu(null);
    };

    if (showModal || popoverMenu) {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("scroll", handleScroll);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("scroll", handleScroll);
    };
  }, [showModal, popoverMenu]);

  useEffect(() => {
    if (data && !userDetailsIsState) {
      const userData = data?.user;

      setTheme(userData?.theme == 1 ? "dark" : "light");
      setCursor(userData?.cursor ? userData?.cursor : 0);
      setTemplate(userData?.template ? userData?.template : 0);
      setUserDetails(userData);
      setIsUserDetailsFromCache(true);
      setCheckList((prevList) => {
        const newList = prevList.map((item) => {
          switch (item.name) {
            case "Add at least 1 Case Study":
              return {
                ...item,
                checked: userData?.projects?.length > 0,
              };
            case "Add Skills":
              return { ...item, checked: userData?.skills?.length > 0 };
            case "Add Experience":
              return {
                ...item,
                checked: userData?.experiences?.length > 0,
              };
            case "Add Testimonials":
              return { ...item, checked: userData?.reviews?.length > 0 };

            default:
              return item;
          }
        });
        const completedTasks = newList.filter((item) => item.checked).length;
        setIsTaskCompleted(completedTasks === newList.length);
        setTaskPercentage((completedTasks / newList.length) * 100);
        return newList;
      });
    }
  }, [data, userDetailsIsState]);

  useEffect(() => {
    setCursorvalue(cursor);
  }, [cursor]);

  useEffect(() => {
    if (userDetails?.pro) {
      fetchDomainDetails();
    }
  }, [userDetails?.pro]);

  const fetchDomainDetails = () => {
    _getDomainDetails().then((res) => {
      setDomainDetails(res.data);
    });
  };

  const updateCache = (key, data) => {
    queryClient.setQueriesData({ queryKey: [key] }, (oldData) => {
      return { user: { ...oldData?.user, ...data } };
    });
  };

  const changeCursor = (cursor) => {
    _updateUser({ cursor: cursor }).then((res) => {
      setCursor(cursor);
      updateCache("userDetails", res?.data?.user);
      setUserDetails(() => ({ ...userDetails, cursor: cursor }));
    });
  };

  const changeTemplate = (template) => {
    _updateUser({ template: template }).then((res) => {
      setTemplate(template);
      updateCache("userDetails", res?.data?.user);
      setUserDetails(() => ({ ...userDetails, template: template }));
    });
  };

  const changeTheme = (theme) => {
    _updateUser({ theme: theme }).then((res) => {
      setTheme(theme == 1 ? "dark" : "light");
      updateCache("userDetails", res?.data?.user);
      setUserDetails(() => ({ ...userDetails, theme: theme }));
    });
  };

  const openModal = (type = null) => {
    setShowModal(type);
    setPopoverMenu(null);
  };

  const closeModal = () => {
    setShowModal(null);
    setSelectedProject(null);
    setSelectedReview(null);
    setSelectedWork(null);
    setStep(1);
  };


  const setTemplateContext = (value) => {
    setTemplate(value);
    setUserDetails((prev) => ({
      ...prev,
      template: value,
    }));
  };


  
  return (
    <GlobalContext.Provider
      value={{
        popoverMenu,
        setPopoverMenu,
        userDetailLoading: isLoading,
        userDetails,
        setUserDetails,
        userDetailsRefecth,
        setIsUserDetailsFromCache,
        userDetailsIsState,
        changeTheme,
        isTaskCompleted,
        taskPercentage,
        checkList,
        showModal,
        setShowModal,
        step,
        setStep,
        openModal,
        closeModal,
        updateCache,
        projectRef,
        selectedProject,
        setSelectedProject,
        selectedReview,
        setSelectedReview,
        selectedWork,
        setSelectedWork,
        wordCount,
        setWordCount,
        projectValue,
        setProjectValue,
        cursor,
        setCursor,
        changeCursor,
        changeTemplate,
        template,
        setTemplate,
        showUpgradeModal,
        setShowUpgradeModal,
        domainDetails,
        setDomainDetails,
        fetchDomainDetails,
        setTemplateContext
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
