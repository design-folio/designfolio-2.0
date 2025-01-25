import React from "react";
import { Card2, CardContent, CardHeader, CardTitle } from "./card2";

export function HeadlineSection({ title, contentText }) {
  const headlines = contentText
    .split("\n")
    .filter((line) => line.match(/^\d\./))
    .map((line) => line.replace(/^\d\.\s*/, "").trim());

  return (
    <Card2 className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {headlines.map((headline, idx) => (
            <Card2 key={idx} className="p-4">
              <CardContent className="p-0">
                <p className="text-sm">{headline}</p>
              </CardContent>
            </Card2>
          ))}
        </div>
      </CardContent>
    </Card2>
  );
}
