import React from "react";
import { XCircle } from "lucide-react";
import { Card2 } from "./card2";

const GapsSection = ({ gaps }) => {
  return (
    <Card2 className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <XCircle className="w-5 h-5 text-red-500 mr-2" />
        Gaps
      </h3>
      <div className="space-y-3">
        {gaps.map((gap, index) => (
          <div key={index} className="p-3 bg-red-50 rounded-lg">
            <h4 className="font-medium text-red-700">{gap.category}</h4>
            <p className="text-red-600 text-sm mt-1">{gap.details}</p>
          </div>
        ))}
      </div>
    </Card2>
  );
};

export default GapsSection;
