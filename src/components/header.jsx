import { useRouter } from "next/router";
import LandingHeader from "./landingHeader";
import AuthHeader from "./authHeader";
import LoggedInHeader from "./loggedInHeader";
import { useGlobalContext } from "@/context/globalContext";

const Header = ({ dfToken }) => {
  const router = useRouter();
  const { userDetails, popoverMenu, setPopoverMenu, changeTheme } =
    useGlobalContext();

  // Determine header component based on dfToken and router pathname
  let headerComponent = null;
  const path = router.pathname;

  if (path === "/") {
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
      />
    );
  }

  return headerComponent;
};

export default Header;
