import React from "react";
import { useGlobalContext } from "@/context/globalContext";
import Analytics from "@/components/analytics";

function AnalyticsPage() {

    const {
        userDetails,
      } = useGlobalContext();
      
  return (

    <div
    className={`max-w-[890px] mx-auto py-[94px] md:py-[135px] px-2 md:px-4 lg:px-0`}
  >
        <Analytics userDetails={userDetails} />
    </div>
  );
}

export default AnalyticsPage;