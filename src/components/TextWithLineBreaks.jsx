import React, { useState } from "react";

export default function TextWithLineBreaks({ text, color }) {
  const splitCount = 100; // Number of characters to show in "View more" mode
  const [showFullText, setShowFullText] = useState(false);

  // Function to handle "View more/View less"
  const handleShowMore = () => {
    setShowFullText(!showFullText);
  };

  // Replace newline characters with <br /> for HTML rendering

  // Join lines into a single text block for truncation
  const fullText = text;
  const truncatedText =
    text.length > splitCount ? `${text.substring(0, splitCount)}...` : text;

  return (
    <div>
      {/* Render formatted text using dangerouslySetInnerHTML to preserve line breaks */}
      <p
        className={`text-[16px] font-medium leading-[22.4px] font-inter whitespace-pre-line ${color}`}
      >
        {showFullText ? fullText : truncatedText}
      </p>

      {text.length > splitCount && ( // Show button only if truncation is needed
        <button
          className="text-blue-700 hover:text-blue-900 hover:underline font-medium"
          onClick={handleShowMore}
          style={{ color: "#5C6486" }}
        >
          {showFullText ? "View less" : "View more"}
        </button>
      )}
    </div>
  );
}
