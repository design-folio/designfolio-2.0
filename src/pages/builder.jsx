import React, { useEffect } from "react";

import { getServerSideProps } from "@/lib/loggedInServerSideProps";
import { useGlobalContext } from "@/context/globalContext";

export default function Builder() {
  const { setIsUserDetailsFromCache, userDetailsIsState } = useGlobalContext();

  useEffect(() => {
    if (userDetailsIsState) {
      setIsUserDetailsFromCache(false);
    } else {
      setIsUserDetailsFromCache(true);
    }
  }, []);

  return <div>Builder</div>;
}
export { getServerSideProps };
