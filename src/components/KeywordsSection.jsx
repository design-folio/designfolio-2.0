import { Badge } from "@/components/badge";
import { Card2, CardHeader, CardTitle } from "@/components/card2";

export function KeywordsSection({ title, contentText }) {
  const keywords = contentText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <Card2 className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword, idx) => (
            <Badge key={idx} variant="secondary" className="text-sm">
              {keyword}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card2>
  );
}
