import React, { useEffect } from "react";
import { useRouter } from "next/router";
import LandingHeader from "./landingHeader";
import AuthHeader from "./authHeader";
import LoggedInHeader from "./loggedInHeader";
import { useGlobalContext } from "@/context/globalContext";

const Header = ({ dfToken }) => {
  const router = useRouter();
  const { userDetails, popoverMenu, setPopoverMenu, changeTheme } =
    useGlobalContext();

  // State to hold the header component
  const [header, setHeader] = React.useState(null);

  // Effect to determine header component based on dfToken and router pathname
  useEffect(() => {
    const path = router.pathname;

    if (path === "/") {
      setHeader(<LandingHeader dfToken={dfToken} />);
    } else if (!dfToken || (dfToken && path === "/email-verify")) {
      setHeader(<AuthHeader />);
    } else if (dfToken && path !== "/email-verify") {
      setHeader(
        <LoggedInHeader
          dfToken={dfToken}
          userDetails={userDetails}
          popoverMenu={popoverMenu}
          setPopoverMenu={setPopoverMenu}
          changeTheme={changeTheme}
        />
      );
    }
  }, [
    dfToken,
    router.pathname,
    userDetails,
    popoverMenu,
    setPopoverMenu,
    changeTheme,
  ]);

  return header;
};

export default Header;
