import React from "react";

/** Plain-text preview length; matches Canvas testimonial “View more” behavior. */
export const ABOUT_STORY_CHAR_THRESHOLD = 280;

export function truncatePlainText(text, maxChars) {
  if (!text || text.length <= maxChars) return text;
  let cut = text.slice(0, maxChars);
  const lastNl = cut.lastIndexOf("\n");
  const lastSp = cut.lastIndexOf(" ");
  if (lastNl > maxChars * 0.45) cut = cut.slice(0, lastNl);
  else if (lastSp > maxChars * 0.45) cut = cut.slice(0, lastSp);
  return cut.replace(/\s+$/u, "");
}

export function renderDescriptionLines(text) {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, i) => (
    <span key={i}>
      {line}
      {i < lines.length - 1 ? <br /> : null}
    </span>
  ));
}
