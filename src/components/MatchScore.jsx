import React from "react";
import { Card2 } from "./card2";

const MatchScore = ({ score, summary }) => {
  return (
    <Card2 className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Overall Match Score</h3>
        <span className="text-primary text-2xl font-bold">{score}%</span>
      </div>
      {/* <Progress value={score} className="h-4 mb-4" /> */}
      <p className="text-muted-foreground">{summary}</p>
    </Card2>
  );
};

export default MatchScore;
