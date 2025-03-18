import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

export function RichText({ content }) {
  const [embeddedImageStates, setEmbeddedImageStates] = useState({});

  if (!content || !Array.isArray(content)) {
    console.warn("No content to render or content is not an array");
    return null;
  }

  return content
    .map((node, index) => {
      if (!node || !node.nodeType) {
        console.warn("Invalid node:", node);
        return null;
      }

      switch (node.nodeType) {
        case "paragraph":
          if (!node.content) return null;
          return (
            <p
              key={index}
              className="text-[18px] md:text-[20px] leading-[1.6] md:leading-[1.8] mb-6 md:mb-8 text-gray-800 font-normal"
            >
              {node.content.map((inline, i) => {
                if (!inline || !inline.nodeType) return null;
                switch (inline.nodeType) {
                  case "text":
                    let text = inline.value;
                    if (inline.marks) {
                      inline.marks.forEach((mark) => {
                        switch (mark.type) {
                          case "bold":
                            text = (
                              <strong key={i} className="font-semibold">
                                {text}
                              </strong>
                            );
                            break;
                          case "italic":
                            text = <em key={i}>{text}</em>;
                            break;
                          case "underline":
                            text = <u key={i}>{text}</u>;
                            break;
                        }
                      });
                    }
                    return text;
                  case "hyperlink":
                    return (
                      <a
                        key={i}
                        href={inline.data.uri}
                        className="text-blue-600 hover:underline decoration-blue-400 decoration-2"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {inline.content[0].value}
                      </a>
                    );
                  default:
                    return inline.value || "";
                }
              })}
            </p>
          );
        case "heading-1":
          return (
            <h1
              key={index}
              className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 mt-8 md:mt-12 text-gray-900 leading-tight"
            >
              {node.content?.[0]?.value || ""}
            </h1>
          );
        case "heading-2":
          return (
            <h2
              key={index}
              className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 mt-8 md:mt-10 text-gray-900 leading-tight"
            >
              {node.content?.[0]?.value || ""}
            </h2>
          );
        case "heading-3":
          return (
            <h3
              key={index}
              className="text-xl md:text-2xl font-bold mb-3 md:mb-4 mt-6 md:mt-8 text-gray-900 leading-tight"
            >
              {node.content?.[0]?.value || ""}
            </h3>
          );
        case "embedded-asset-block":
          if (node.data?.target?.fields?.file?.url) {
            const imageUrl = node.data.target.fields.file.url;
            const fullImageUrl = imageUrl.startsWith("//")
              ? `https:${imageUrl}`
              : imageUrl.startsWith("http")
              ? imageUrl
              : `https:${imageUrl}`;

            return (
              <div key={index} className="my-8 md:my-12 relative">
                <div className="bg-gray-100 overflow-hidden rounded-lg relative">
                  <Zoom>
                    <img
                      src={fullImageUrl}
                      alt={node.data.target.fields.title || ""}
                      loading="eager"
                      className="w-full transition-opacity duration-300 cursor-zoom-in rounded-lg opacity-100"
                      style={{ objectFit: "contain" }}
                    />
                  </Zoom>
                </div>
              </div>
            );
          }
          return null;
        case "unordered-list":
          if (!node.content) return null;
          return (
            <ul
              key={index}
              className="list-disc list-outside ml-6 mb-6 md:mb-8 space-y-2 md:space-y-3 text-[18px] md:text-[20px] leading-[1.6] md:leading-[1.8] text-gray-800"
            >
              {node.content.map((item, i) => (
                <li key={i} className="pl-2">
                  {item.content?.[0]?.content?.[0]?.value || ""}
                </li>
              ))}
            </ul>
          );
        case "ordered-list":
          if (!node.content) return null;
          return (
            <ol
              key={index}
              className="list-decimal list-outside ml-6 mb-6 md:mb-8 space-y-2 md:space-y-3 text-[18px] md:text-[20px] leading-[1.6] md:leading-[1.8] text-gray-800"
            >
              {node.content.map((item, i) => (
                <li key={i} className="pl-2">
                  {item.content?.[0]?.content?.[0]?.value || ""}
                </li>
              ))}
            </ol>
          );
        default:
          console.log("Unhandled node type:", node.nodeType);
          return null;
      }
    })
    .filter(Boolean);
}
