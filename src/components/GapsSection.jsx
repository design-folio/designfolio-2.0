import React from "react";
import { XCircle } from "lucide-react";
import { Card2 } from "./card2";

const GapsSection = ({ gaps }) => {
  return (
    <Card2 className="p-6">
      <h3 className="mb-4 flex items-center text-lg font-semibold">
        <XCircle className="mr-2 h-5 w-5 text-red-500" />
        Gaps
      </h3>
      <div className="space-y-3">
        {gaps.map((gap, index) => (
          <div key={index} className="rounded-lg bg-red-50 p-3">
            <h4 className="font-medium text-red-700">{gap.category}</h4>
            <p className="mt-1 text-sm text-red-600">{gap.details}</p>
          </div>
        ))}
      </div>
    </Card2>
  );
};

export default GapsSection;
