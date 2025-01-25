import { Card2, CardContent, CardHeader, CardTitle } from "@/components/card2";

export function ContentCalendarSection({ title, contentText }) {
  const rows = contentText
    .split("\n")
    .filter((line) => line.includes("|"))
    .map((line) => line.trim());

  if (rows.length === 0) return null;

  const headers = rows[0]
    .split("|")
    .filter(Boolean)
    .map((cell) => cell.trim());
  const contentRows = rows.slice(2);

  return (
    <Card2 className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contentRows.map((row, rowIdx) => {
            const cells = row
              .split("|")
              .filter(Boolean)
              .map((cell) => cell.trim());
            return (
              <Card2 key={rowIdx} className="p-4">
                <CardContent className="p-0 space-y-2">
                  {cells.map((cell, cellIdx) => (
                    <div key={cellIdx} className="text-sm">
                      <strong>{headers[cellIdx]}:</strong> {cell}
                    </div>
                  ))}
                </CardContent>
              </Card2>
            );
          })}
        </div>
      </CardContent>
    </Card2>
  );
}
