export const useStrategyProcessor = (strategy) => {
  if (!strategy?.candidates?.[0]?.content?.parts?.[0]?.text) {
    return null;
  }

  const text = strategy.candidates[0].content.parts[0].text;
  const sections = text.split(/(?=## )/).filter(Boolean);

  const processedSections = sections.map((section) => {
    const [titleLine, ...content] = section.trim().split("\n");
    const title = titleLine.replace(/^## /, "").trim();
    const contentText = content.join("\n").trim();

    return {
      title,
      content: contentText,
      type: title.toLowerCase().includes("headline")
        ? "headline"
        : title.toLowerCase().includes("calendar")
        ? "calendar"
        : title.toLowerCase().includes("keywords")
        ? "keywords"
        : title.toLowerCase().includes("tips") ||
          title.toLowerCase().includes("strategy")
        ? "checklist"
        : "general",
    };
  });

  return processedSections;
};
