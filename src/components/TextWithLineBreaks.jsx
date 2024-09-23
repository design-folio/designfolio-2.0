import React from "react";

export default function TextWithLineBreaks({ text, color }) {
  // Split the text into lines at newline characters
  const lines = text.split("\n");

  return (
    <div>
      {lines.map((line, index) => (
        <React.Fragment key={index}>
          <p
            className={`text-[#4d545f] text-[16px] font-[400] leading-[22.4px] font-inter ${
              index < lines.length && "mt-2"
            } ${color}`}
          >
            {line}
          </p>
        </React.Fragment>
      ))}
    </div>
  );
}
