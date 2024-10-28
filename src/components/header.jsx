import { useRouter } from "next/router";
import LandingHeader from "./landingHeader";
import AuthHeader from "./authHeader";
import LoggedInHeader from "./loggedInHeader";
import { useGlobalContext } from "@/context/globalContext";

const Header = ({ dfToken, hideHeader }) => {
  const router = useRouter();
  const {
    userDetails,
    popoverMenu,
    setPopoverMenu,
    changeTheme,
    setUserDetails,
    updateCache,
    cursor,
    setCursor,
    changeCursor,
  } = useGlobalContext();

  // Determine header component based on dfToken and router pathname
  let headerComponent = null;
  const path = router.pathname;
  if (hideHeader) {
    return null;
  } else if (path === "/") {
    headerComponent = <LandingHeader dfToken={dfToken} />;
  } else if (!dfToken || (dfToken && path === "/email-verify")) {
    headerComponent = <AuthHeader />;
  } else if (dfToken && path !== "/email-verify") {
    headerComponent = (
      <LoggedInHeader
        dfToken={dfToken}
        userDetails={userDetails}
        popoverMenu={popoverMenu}
        setPopoverMenu={setPopoverMenu}
        changeTheme={changeTheme}
        setUserDetails={setUserDetails}
        updateCache={updateCache}
        cursor={cursor}
        setCursor={setCursor}
        changeCursor={changeCursor}
      />
    );
  }

  return headerComponent;
};

export default Header;
