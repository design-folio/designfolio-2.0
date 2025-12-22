import { setCursorvalue } from "@/lib/cursor";
import { setWallpaperValue, getWallpaperUrl } from "@/lib/wallpaper";
import { _getDomainDetails, _getUserDetails } from "@/network/get-request";
import { _updateUser } from "@/network/post-request";
import queryClient from "@/network/queryClient";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useTheme } from "next-themes";
import { popovers, sidebars } from "@/lib/constant";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  useMemo,
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
  const [wallpaper, setWallpaper] = useState(0);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState(null);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingSidebarAction, setPendingSidebarAction] = useState(null);
  const [isSwitchingSidebar, setIsSwitchingSidebar] = useState(false);
  const unsavedChangesCheckers = useRef({});
  const { setTheme, theme, resolvedTheme } = useTheme();

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
      if (popoverMenu !== popovers.themeMenu) {
        setPopoverMenu(null);
      }
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

      const wp = userData?.wallpaper;
      const wpValue = (wp && typeof wp === 'object') ? (wp.url || wp.value) : wp;
      setWallpaper(wpValue !== undefined ? wpValue : 0);

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

  useEffect(() => {
    setWallpaperValue(wallpaper, resolvedTheme || theme);
  }, [wallpaper, resolvedTheme, theme]);

  // Compute wallpaper URL centrally - handles object and primitive values
  const wallpaperUrl = useMemo(() => {
    const wp = wallpaper;
    const wpValue = (wp && typeof wp === 'object') ? (wp.url || wp.value) : wp;
    const currentTheme = resolvedTheme || theme;

    return wpValue && wpValue !== 0
      ? getWallpaperUrl(wpValue, currentTheme)
      : null;
  }, [wallpaper, resolvedTheme, theme]);

  const fetchDomainDetails = () => {
    _getDomainDetails().then((res) => {
      setDomainDetails(res.data);
    });
  };

  const updateCache = (key, data) => {
    queryClient.setQueriesData({ queryKey: [key] }, (oldData) => {
      //INFO: If oldData doesn't exist, initialize it with the new data
      if (!oldData) {
        return { user: data };
      }
      //INFO: If oldData doesn't exist, initialize it with the new data
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

  const changeWallpaper = (wallpaper, filename) => {
    let wallpaperPayload;

    // Check for custom wallpaper object (Base64)
    if (typeof wallpaper === 'object' && wallpaper.base64) {
      wallpaperPayload = {
        key: wallpaper.base64,
        extension: wallpaper.type,
        originalName: wallpaper.name, // or filename argument
        __isNew__: true
      };
      // Set local state to valid CSS string (Base64)
      wallpaper = wallpaper.base64;
    }
    // Handle string URL
    else if (typeof wallpaper === 'string') {
      let key = wallpaper;

      // If it's a full URL (existing S3 URL), extract the key component
      if (wallpaper.startsWith('http') || wallpaper.startsWith('/')) {
        const match = wallpaper.match(/(wallpaper\/.*?)(\?|$)/);
        if (match) {
          key = match[1];
        }
      }
      // If filename provided, construct new key (for fresh non-base64 uploads logic if used)
      else if (filename && userDetails) {
        const userId = userDetails._id || userDetails.id;
        key = `wallpaper/${userId}/${filename}`;
      }

      wallpaperPayload = {
        key: key,
        __isNew__: true
      };
    }
    // Handle Preset (number)
    else {
      wallpaperPayload = {
        value: wallpaper
      };
    }

    _updateUser({ wallpaper: wallpaperPayload }).then((res) => {
      const updatedUser = res?.data?.user;

      // Extract authoritative wallpaper value from response
      const wp = updatedUser?.wallpaper;
      const wpValue = (wp && typeof wp === 'object') ? (wp.url || wp.value) : wp;

      // Update local state and context - only update wallpaper field to prevent signed URL changes
      setWallpaper(wpValue || wallpaper);
      // Only update wallpaper in cache to prevent flickers from new signed URLs
      updateCache("userDetails", { wallpaper: wp });
      // Only update wallpaper field in userDetails, not the entire object
      setUserDetails((prev) => ({
        ...prev,
        wallpaper: wp,
      }));
    });
  };

  const changeTemplate = (template) => {
    setIsLoadingTemplate(true);
    _updateUser({ template: template })
      .then((res) => {
        setTemplate(template);
        updateCache("userDetails", res?.data?.user);
        setUserDetails(() => ({ ...userDetails, template: template }));
      })
      .catch((error) => {
        console.error("Error changing template:", error);
      })
      .finally(() => {
        setIsLoadingTemplate(false);
      });
  };

  const changeTheme = (theme) => {
    _updateUser({ theme: theme }).then((res) => {
      setTheme(theme == 1 ? "dark" : "light");
      // Only update theme field in cache, not the whole user object
      updateCache("userDetails", { theme: theme });
      setUserDetails((prev) => ({ ...prev, theme: theme }));
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

  // Register unsaved changes checker for a sidebar
  const registerUnsavedChangesChecker = (sidebarType, checker) => {
    unsavedChangesCheckers.current[sidebarType] = checker;
  };

  // Unregister unsaved changes checker for a sidebar
  const unregisterUnsavedChangesChecker = (sidebarType) => {
    delete unsavedChangesCheckers.current[sidebarType];
  };

  // Check if current sidebar has unsaved changes
  const hasUnsavedChanges = () => {
    if (!activeSidebar) return false;
    const checker = unsavedChangesCheckers.current[activeSidebar];
    return checker ? checker() : false;
  };

  // Open sidebar with unsaved changes check
  const openSidebar = (sidebarType) => {
    // If trying to open the same sidebar, do nothing
    if (activeSidebar === sidebarType) return;

    // If another sidebar is open, check for unsaved changes
    if (activeSidebar) {
      const hasChanges = hasUnsavedChanges();
      if (hasChanges) {
        // Show warning and store the pending action
        setIsSwitchingSidebar(true);
        setShowUnsavedWarning(true);
        setPendingSidebarAction({ type: "open", sidebarType });
        return;
      }
    }

    // No unsaved changes or no active sidebar, proceed to open
    setActiveSidebar(sidebarType);
    setPopoverMenu(null);
  };

  // Close sidebar with unsaved changes check
  const closeSidebar = (force = false) => {
    if (!activeSidebar) return;

    // Check for unsaved changes unless forced
    if (!force) {
      const hasChanges = hasUnsavedChanges();
      if (hasChanges) {
        setShowUnsavedWarning(true);
        setPendingSidebarAction({ type: "close" });
        return;
      }
    }

    // No unsaved changes or forced, proceed to close
    setActiveSidebar(null);
  };

  // Handle unsaved changes dialog confirmation
  const handleConfirmDiscardSidebar = () => {
    setShowUnsavedWarning(false);
    setIsSwitchingSidebar(false);

    if (pendingSidebarAction) {
      if (pendingSidebarAction.type === "open") {
        // Close current sidebar and open new one
        setActiveSidebar(pendingSidebarAction.sidebarType);
        setPopoverMenu(null);
      } else if (pendingSidebarAction.type === "close") {
        // Close current sidebar
        setActiveSidebar(null);
      }
      setPendingSidebarAction(null);
    }
  };

  // Handle unsaved changes dialog cancel
  const handleCancelDiscardSidebar = () => {
    setShowUnsavedWarning(false);
    setIsSwitchingSidebar(false);
    setPendingSidebarAction(null);
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
        setTemplateContext,
        wallpaper,
        setWallpaper,
        changeWallpaper,
        wallpaperUrl,
        isLoadingTemplate,
        activeSidebar,
        openSidebar,
        closeSidebar,
        registerUnsavedChangesChecker,
        unregisterUnsavedChangesChecker,
        showUnsavedWarning,
        setShowUnsavedWarning,
        handleConfirmDiscardSidebar,
        handleCancelDiscardSidebar,
        isSwitchingSidebar,
        pendingSidebarAction,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
