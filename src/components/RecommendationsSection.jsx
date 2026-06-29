import React from "react";
import { AlertCircle } from "lucide-react";
import { Card2 } from "./card2";
import { Badge } from "./badge";

const RecommendationsSection = ({ recommendations }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <Card2 className="p-6">
      <h3 className="mb-4 flex items-center text-lg font-semibold">
        <AlertCircle className="mr-2 h-5 w-5 text-blue-500" />
        Priority Recommendations
      </h3>
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div
            key={index}
            className="flex flex-col items-start gap-4 rounded-lg bg-gray-50 p-4 lg:flex-row"
          >
            <Badge variant="outline" className={getPriorityColor(rec.priority)}>
              {rec.priority}
            </Badge>
            <div>
              <p className="font-medium">{rec.action}</p>
              <p className="mt-1 text-sm text-gray-600">{rec.impact}</p>
            </div>
          </div>
        ))}
      </div>
    </Card2>
  );
};

export default RecommendationsSection;
