import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Card2 } from "./card2";

const StrengthsSection = ({ strengths }) => {
  return (
    <Card2 className="p-6">
      <h3 className="mb-4 flex items-center text-lg font-semibold">
        <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
        Strengths
      </h3>
      <div className="space-y-3">
        {strengths.map((strength, index) => (
          <div key={index} className="rounded-lg bg-green-50 p-3">
            <h4 className="font-medium text-green-700">{strength.category}</h4>
            <p className="mt-1 text-sm text-green-600">{strength.details}</p>
          </div>
        ))}
      </div>
    </Card2>
  );
};

export default StrengthsSection;
