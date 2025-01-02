import React from "react";
import Text from "./text";
import OfferAnalysis from "./OfferAnalysis";

export default function OfferTool() {
  return (
    <div className="max-w-[843px] mx-auto">
      {/* Title only shows before analysis */}
      <div className="text-center mb-12" id="initial-title">
        <Text
          size="p-large"
          className="text-center text-[#202937] font-satoshi"
        >
          Salary Negotiation Assistant{" "}
        </Text>
        <Text
          size="p-small"
          className="text-center text-[#475569] font-medium mt-4"
        >
          Learn how to negotiate and get the salary you deserve.{" "}
        </Text>
      </div>
      <OfferAnalysis />
    </div>
  );
}
