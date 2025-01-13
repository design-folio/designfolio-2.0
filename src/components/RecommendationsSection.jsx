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
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <AlertCircle className="w-5 h-5 text-blue-500 mr-2" />
        Priority Recommendations
      </h3>
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
          >
            <Badge variant="outline" className={getPriorityColor(rec.priority)}>
              {rec.priority}
            </Badge>
            <div>
              <p className="font-medium">{rec.action}</p>
              <p className="text-sm text-gray-600 mt-1">{rec.impact}</p>
            </div>
          </div>
        ))}
      </div>
    </Card2>
  );
};

export default RecommendationsSection;
