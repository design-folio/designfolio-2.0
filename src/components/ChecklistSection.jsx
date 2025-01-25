import { Card2, CardContent, CardHeader, CardTitle } from "@/components/card2";

export function ChecklistSection({ title, contentText }) {
  const items = contentText
    .split("\n")
    .map((line) => line.replace(/^[•→]|-\s*/, "").trim())
    .filter(Boolean);

  return (
    <Card2 className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-start space-x-2">
              {/* <Checkbox id={`item-${idx}`} /> */}
              <label
                htmlFor={`item-${idx}`}
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {item}
              </label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card2>
  );
}
