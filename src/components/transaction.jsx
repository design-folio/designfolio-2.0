import { _getPaymentDetails } from "@/network/get-request";
import React, { useEffect } from "react";

export default function Transaction() {
  // useEffect(() => {
  //   _getPaymentDetails().then((res) => {
  //     console.log(res.data);
  //   });
  // }, []);
  return (
    <div>
      <p className="text-[20px] text-df-section-card-heading-color font-[500] font-inter ">
        Payment Details
      </p>
    </div>
  );
}
