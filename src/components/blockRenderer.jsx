/* eslint-disable react/display-name */
import React, { useMemo, useState, useRef } from "react";
import Blocks from "editorjs-blocks-react-renderer";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import DOMPurify from "dompurify";

// Custom list renderer component
const CustomListRenderer = React.memo(({ items, listType = "unordered" }) => {
  const ListTag = listType === "unordered" ? "ul" : "ol";
  const listClass =
    listType === "ordered" ? "list-decimal pl-5" : "list-disc pl-5";

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

  return (
    <div className="figma-tool">
      <div className="figma-preview">
        {iframeSrc ? (
          <iframe
            style={{ border: "1px solid rgba(0, 0, 0, 0.1)" }}
            width="800"
            height="450"
            src={`https://www.figma.com/embed?embed_host=share&url=${iframeSrc}`}
            allowFullScreen
            title="Figma Embed"
          />
        ) : (
          <div className="w-full h-full bg-[#EFF0F0] dark:bg-[#383A47] rounded-[18px]">
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
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !inView) {
        setInView(true);
        observer.unobserve(ref.current); // Stop observing once in view
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
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
            className={`w-full h-full ${getClassNames} rounded-[20px] object-cover transition-opacity duration-100 mt-6 md:mt-8 ${
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
            <div className="w-full h-full bg-df-placeholder-color rounded-[18px] absolute top-0 right-0" />
          )}
        </Zoom>
      ) : (
        <div className="w-full h-full bg-df-placeholder-color rounded-[18px]" />
      )}
      <figcaption>{block?.data?.caption || ""}</figcaption>
    </figure>
  );
});

const BlockRenderer = ({ editorJsData }) => {
  const renderers = useMemo(
    () => ({
      list: (data) => (
        <CustomListRenderer
          items={data.data.items}
          listType={data.data.style}
        />
      ),
      image: (data) => <RenderImageBlock block={data} />,
      table: (data) => (
        <div className="table-wrapper">
          <table className="border-collapse table-auto w-full text-sm">
            <thead>
              <tr>
                {data?.data?.content[0]?.map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.data?.content.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
      figma: (data) => <FigmaBlock block={data} />,
    }),
    []
  );

  return (
    <div className="bg-df-section-card-bg-color shadow-df-section-card-shadow rounded-[24px] p-4 lg:p-[32px] break-words project-editor">
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
