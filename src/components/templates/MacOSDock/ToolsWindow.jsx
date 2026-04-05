import React from "react";
import Button3D from "../../ui/button-3d";

const ToolsWindow = ({ tools = [], edit, onEdit }) => {
  if (!tools || tools.length === 0) {
    return (
      <div className="w-full h-full bg-white flex flex-col items-center justify-center font-azeretMono text-[#37352f]">
        <span className="text-5xl mb-4">🛠️</span>
        <p className="text-lg font-semibold mb-1">No tools added yet</p>
        <p className="text-sm opacity-50">
          Add your tool stack to showcase your skills
        </p>
        {edit && (
          <button
            onClick={onEdit}
            className="mt-6 px-4 py-2 bg-[#007aff] text-white text-sm rounded-lg hover:bg-[#0062cc] transition-colors"
          >
            Add Tools
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white flex flex-col font-azeretMono text-[#37352f]">
      {/* Header */}
      <div className="px-10 pt-12 pb-4">
        <div className="flex items-center gap-4 mb-2 opacity-50 text-sm">
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
      <div className="px-10 pb-20 overflow-y-auto">
        <div className="flex flex-wrap gap-6 mt-6">
          {tools.map((tool, i) => (
            <div
              key={i}
              className="group flex flex-col items-center gap-2 cursor-default"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#f7f6f3] border border-[#e9e9e7] flex items-center justify-center hover:bg-[#efeee9] hover:scale-110 transition-all duration-200 shadow-sm">
                <img
                  src={tool.image || "/assets/svgs/default-tools.svg"}
                  alt={tool.label || tool.name || ""}
                  className="w-9 h-9 object-contain"
                />
              </div>
              <span className="text-[11px] text-[#37352f]/70 text-center max-w-[64px] truncate">
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
