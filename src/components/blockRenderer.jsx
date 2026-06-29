/* eslint-disable react/display-name */
import React, { useMemo, useState, useRef } from "react";
import Blocks from "editorjs-blocks-react-renderer";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import DOMPurifyLib from "dompurify";

// DOMPurify requires window, so we need to handle SSR
const DOMPurify = typeof window !== "undefined" ? DOMPurifyLib : { sanitize: (html) => html };
import he from "he";
import { cn } from "@/lib/utils";
// Custom list renderer component
const CustomListRenderer = React.memo(({ items, listType = "unordered" }) => {
  const ListTag = listType === "unordered" ? "ul" : "ol";
  const listClass = listType === "ordered" ? "list-decimal pl-5" : "list-disc pl-5";

  const renderedItems = useMemo(() => {
    return items.map((item, index) => {
      const isNested = item.items && Array.isArray(item.items);

      return (
        <li key={index} className="mt-2">
          {isNested ? (
            <>
              <span
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(item.content),
                }}
              />
              <CustomListRenderer items={item.items} listType={listType} />
            </>
          ) : (
            item.content || item
          )}
        </li>
      );
    });
  }, [items, listType]);

  return <ListTag className={listClass}>{renderedItems}</ListTag>;
});

const FigmaBlock = ({ block }) => {
  const iframeSrc = block?.data?.url || "";
  // Regular expression to match the src attribute value
  var srcRegex = /src="([^"]*)"/;
  var match = srcRegex.exec(iframeSrc);

  // Extract the src value from the match
  var srcValue = match ? match[1] : "";
  return (
    <div className="figma-tool">
      <div className="figma-preview">
        {iframeSrc ? (
          <iframe
            style={{ border: "1px solid rgba(0, 0, 0, 0.1)" }}
            width="800"
            height="450"
            src={srcValue}
            allowFullScreen
            title="Figma Embed"
          />
        ) : (
          <div className="h-full w-full rounded-[18px] bg-[#EFF0F0] dark:bg-[#383A47]">
            No Figma URL provided.
          </div>
        )}
      </div>
    </div>
  );
};

// Custom hook for IntersectionObserver
const useIntersectionObserver = (options) => {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  React.useEffect(() => {
    const node = ref.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !inView) {
        setInView(true);
        if (node) observer.unobserve(node);
      }
    }, options);

    if (node) {
      observer.observe(node);
    }

    return () => {
      if (node) {
        observer.unobserve(node);
      }
    };
  }, [options, inView]);

  return [ref, inView];
};

// Function to get class names for block
const useGetClassNames = (block) => {
  return React.useMemo(() => {
    const classNames = [];
    if (block?.data?.stretched) {
      classNames.push(block?.actionsClassNames?.stretched);
    }

    if (block?.data?.withBackground) {
      classNames.push(block?.actionsClassNames?.withBackground);
    }

    if (block?.data?.withBorder) {
      classNames.push(block?.actionsClassNames?.withBorder);
    }

    return classNames.join(" ");
  }, [block]);
};

// Render image block component
const RenderImageBlock = React.memo(({ block }) => {
  const [ref, inView] = useIntersectionObserver({ threshold: 1 });
  const getClassNames = useGetClassNames(block);
  const [isImageLoaded, setImageIsLoaded] = useState(false);

  return (
    <figure className="relative" ref={ref}>
      {inView ? (
        <Zoom key={block?.data?.file?.url}>
          <img
            src={block?.data?.file?.url}
            alt="project image"
            className={`h-full w-full ${getClassNames} mt-6 rounded-[20px] object-cover transition-opacity duration-100 md:mt-8 ${
              isImageLoaded ? "opacity-100" : "opacity-0"
            }`}
            loading="lazy"
            fetchPriority="high"
            decoding="async"
            onLoad={(e) => {
              setImageIsLoaded(true);
            }}
          />
          {!isImageLoaded && (
            <div className="bg-df-placeholder-color absolute top-0 right-0 h-full w-full rounded-[18px]" />
          )}
        </Zoom>
      ) : (
        <div className="bg-df-placeholder-color h-full w-full rounded-[18px]" />
      )}
      <figcaption
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(he.decode(block?.data?.caption || "")),
        }}
      />
    </figure>
  );
});

const BreakLineBlock = ({ data }) => {
  if (data.divider) {
    return <hr style={{ borderColor: "#ccc", margin: "1em 0" }} />;
  }
  return <br />;
};

const BlockRenderer = ({ editorJsData, className }) => {
  const renderers = useMemo(
    () => ({
      list: (data) => <CustomListRenderer items={data.data.items} listType={data.data.style} />,
      image: (data) => <RenderImageBlock block={data} />,
      table: (data) => (
        <div className="table-wrapper mt-4">
          <table className="w-full table-auto border-collapse text-sm">
            <thead>
              <tr>
                {data?.data?.content[0]?.map((header, index) => {
                  const decoded = he.decode(he.decode(header)); // decode twice for entities
                  const cleanHTML = DOMPurify.sanitize(decoded);
                  return (
                    <th
                      key={index}
                      dangerouslySetInnerHTML={{ __html: cleanHTML }}
                      className="p-2"
                    />
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {data?.data?.content.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => {
                    const decoded = he.decode(he.decode(cell));
                    const cleanHTML = DOMPurify.sanitize(decoded);
                    return (
                      <td
                        key={cellIndex}
                        dangerouslySetInnerHTML={{ __html: cleanHTML }}
                        className="p-2"
                      />
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
      figma: (data) => <FigmaBlock block={data} />,
      breakLine: (data) => <BreakLineBlock data={data.data} />,
    }),
    []
  );

  return (
    <div
      className={cn(
        "bg-card shadow-df-section-card-shadow project-editor rounded-[24px] p-4 break-words lg:p-[32px]",
        className
      )}
    >
      <Blocks
        data={editorJsData}
        config={{
          code: {
            className: "language-js",
          },
          delimiter: {
            className: "border border-2 w-16 mx-auto",
          },
          embed: {
            className: "border-0",
          },
          header: {
            className: "font-bold",
          },
          image: {
            className: "w-full max-w-screen my-4",
            actionsClassNames: {
              stretched: "w-full object-cover",
              withBorder: "border border-2",
              withBackground: "p-2",
            },
          },
          paragraph: {
            className: "text-base text-opacity-75",
            actionsClassNames: {
              alignment: "text-{alignment}", // This is a substitution placeholder: left or center.
            },
          },
          quote: {
            className: "py-3 px-5 italic font-serif",
          },
          table: {
            className: "border-collapse table-auto w-full text-sm",
          },
        }}
        renderers={renderers}
      />
    </div>
  );
};

export default BlockRenderer;
