import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Card2 } from "./card2";

const StrengthsSection = ({ strengths }) => {
  return (
    <Card2 className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
        Strengths
      </h3>
      <div className="space-y-3">
        {strengths.map((strength, index) => (
          <div key={index} className="p-3 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-700">{strength.category}</h4>
            <p className="text-green-600 text-sm mt-1">{strength.details}</p>
          </div>
        ))}
      </div>
    </Card2>
  );
};

export default StrengthsSection;
