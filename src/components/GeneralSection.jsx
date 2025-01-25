import { Card2, CardContent, CardHeader, CardTitle } from "@/components/card2";
import ReactMarkdown from "react-markdown";

export function GeneralSection({ title, contentText }) {
  return (
    <Card2 className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ReactMarkdown
          className="prose prose-sm max-w-none"
          components={{
            p: ({ node, ...props }) => <p className="mb-4" {...props} />,
            ul: ({ node, ...props }) => (
              <ul className="list-disc pl-4 mb-4" {...props} />
            ),
            li: ({ node, ...props }) => <li className="mb-2" {...props} />,
            h3: ({ node, ...props }) => (
              <h3 className="text-lg font-semibold mb-2" {...props} />
            ),
            h4: ({ node, ...props }) => (
              <h4 className="text-md font-semibold mb-2" {...props} />
            ),
          }}
        >
          {contentText}
        </ReactMarkdown>
      </CardContent>
    </Card2>
  );
}
