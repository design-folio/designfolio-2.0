import React from "react";
import Button3D from "../../ui/button-3d";

const ToolsWindow = ({ tools = [], edit, onEdit }) => {
  if (!tools || tools.length === 0) {
    return (
      <div className="font-azeretMono flex h-full w-full flex-col items-center justify-center bg-white text-[#37352f]">
        <span className="mb-4 text-5xl">🛠️</span>
        <p className="mb-1 text-lg font-semibold">No tools added yet</p>
        <p className="text-sm opacity-50">Add your tool stack to showcase your skills</p>
        {edit && (
          <button
            onClick={onEdit}
            className="mt-6 rounded-lg bg-[#007aff] px-4 py-2 text-sm text-white transition-colors hover:bg-[#0062cc]"
          >
            Add Tools
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="font-azeretMono flex h-full w-full flex-col bg-white text-[#37352f]">
      {/* Header */}
      <div className="px-10 pt-12 pb-4">
        <div className="mb-2 flex items-center gap-4 text-sm opacity-50">
          <span>🛠️</span>
          <span>Tools</span>
          <span>/</span>
          <span>tools.mdx</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-[#37352f]">Tool Stack</h1>
          {edit && <Button3D onClick={onEdit}>EDIT</Button3D>}
        </div>
      </div>

      {/* Tool grid */}
      <div className="overflow-y-auto px-10 pb-20">
        <div className="mt-6 flex flex-wrap gap-6">
          {tools.map((tool, i) => (
            <div key={i} className="group flex cursor-default flex-col items-center gap-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#e9e9e7] bg-[#f7f6f3] shadow-sm transition-all duration-200 hover:scale-110 hover:bg-[#efeee9]">
                <img
                  src={tool.image || "/assets/svgs/default-tools.svg"}
                  alt={tool.label || tool.name || ""}
                  className="h-9 w-9 object-contain"
                />
              </div>
              <span className="max-w-[64px] truncate text-center text-[11px] text-[#37352f]/70">
                {tool.label || tool.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ToolsWindow;
