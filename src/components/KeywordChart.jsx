import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card2 } from "./card2";
import { Badge } from "./badge";

const KeywordChart = ({ data }) => {
  const getImportanceColor = (importance) => {
    switch (importance) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card2 className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Keyword Frequency Analysis</h3>
        <div className="flex gap-2">
          {["high", "medium", "low"].map((importance) => (
            <Badge
              key={importance}
              variant="outline"
              className={getImportanceColor(importance)}
            >
              {importance}
            </Badge>
          ))}
        </div>
      </div>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="keyword" angle={-45} textAnchor="end" height={70} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="resumeCount"
              name="Resume"
              fill="#4ade80"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="jdCount"
              name="Job Description"
              fill="#60a5fa"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card2>
  );
};

export default KeywordChart;
