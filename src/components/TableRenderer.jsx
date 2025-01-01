import { ReportTable } from "./ReportTable";

export const TableRenderer = ({ node }) => {
  console.log("Rendering table node:", node);

  const parseMarkdownTable = (text) => {
    console.log("Parsing table text:", text);
    const lines = text.trim().split("\n");

    if (lines.length < 3) {
      console.log("Not enough lines for a table");
      return null;
    }

    const headers = lines[0]
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell) => cell);

    const rows = lines.slice(2).map((line) =>
      line
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell) => cell)
    );

    console.log("Parsed table:", { headers, rows });
    return { headers, rows };
  };

  const tableText = node.children
    .map((row) =>
      row.children.map((cell) => cell.children[0]?.value || "").join(" | ")
    )
    .join("\n");

  console.log("Table text extracted:", tableText);

  const parsedTable = parseMarkdownTable(tableText);

  if (parsedTable) {
    console.log("Table parsed successfully, rendering ReportTable");
    return (
      <ReportTable headers={parsedTable.headers} rows={parsedTable.rows} />
    );
  }

  return (
    <div className="overflow-x-auto my-6">
      <table className="w-full border-collapse bg-white shadow-sm rounded-lg">
        <tbody>
          {node.children.map((row, i) => (
            <tr key={i} className="border-b border-gray-200">
              {row.children.map((cell, j) => {
                const Tag = i === 0 ? "th" : "td";
                return (
                  <Tag key={j} className="p-4 text-left">
                    {cell.children[0]?.value || ""}
                  </Tag>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
