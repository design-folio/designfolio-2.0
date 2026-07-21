import { useMemo } from "react";
import { Pencil } from "lucide-react";
import { useGlobalContext } from "@/context/globalContext";
import { sidebars } from "@/lib/constant";
import { SectionVisibilityButton } from "@/components/section";

export default function DesignerSkillsTools({ isEditing }) {
  const { userDetails, openSidebar } = useGlobalContext();
  const { skills = [], tools = [] } = userDetails || {};

  const repeatedSkills = useMemo(() => [...skills, ...skills], [skills]);
  const repeatedTools = useMemo(() => [...tools, ...tools], [tools]);

  if (!isEditing && skills.length === 0 && tools.length === 0) return null;

  return (
    <div className="pt-14">
      {isEditing && (skills.length > 0 || tools.length > 0) && (
        <div className="mb-4 flex items-center justify-end gap-2 px-6 md:px-0">
          {skills.length > 0 && (
            <button
              onClick={() => openSidebar(sidebars.skills)}
              className="flex h-8 items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-3 text-[12px] font-medium shadow-sm hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Skills
            </button>
          )}
          {tools.length > 0 && (
            <button
              onClick={() => openSidebar(sidebars.tools)}
              className="flex h-8 items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-3 text-[12px] font-medium shadow-sm hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Tools
            </button>
          )}
          <SectionVisibilityButton
            sectionId="tools"
            className="h-8 w-8 rounded-full border border-[#E2E8F0] bg-white shadow-sm hover:bg-gray-50"
          />
        </div>
      )}

      {/* left/marginLeft/width:100vw breaks out to the true viewport edges (for the
          overflow:hidden clip below); maxWidth+margin:auto then caps how wide the
          *rotated* bands themselves get. The rotate() tilt shifts the band's far edges
          vertically by roughly half-width × tan(angle) — at the ~1024px width the
          reference was tuned at that's a subtle ~22px "sash" tilt, but left uncapped on
          a real unconstrained desktop width (2000-3000px+) the same 2.5° angle shifts
          the edges 60-100px+, taller than the band itself, collapsing it into a wedge. */}
      <div
        className="relative"
        style={{ left: "50%", marginLeft: "-50vw", width: "100vw", overflow: "hidden" }}
      >
        {skills.length > 0 && (
          <div style={{ maxWidth: 1400, margin: "0 auto 28px", perspective: 700 }}>
            <div style={{ margin: "0 -80px" }}>
              <div
                style={{
                  transform: "rotate(-2.5deg) rotateX(10deg)",
                  transformOrigin: "center bottom",
                  background: "linear-gradient(180deg, #1e3a5c 0%, #0f172a 45%, #04090f 100%)",
                  padding: "14px 0",
                  overflow: "hidden",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -2px 0 rgba(0,0,0,0.4)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 36,
                    width: "max-content",
                    animation: "designer-skills-ltr 28s linear infinite",
                  }}
                >
                  {[0, 1].map((copy) => (
                    <div
                      key={copy}
                      style={{ display: "flex", gap: 36, alignItems: "center", flexShrink: 0 }}
                    >
                      {repeatedSkills.map((skill, j) => (
                        <div
                          key={j}
                          style={{ display: "flex", alignItems: "center", gap: 36, flexShrink: 0 }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: "#F8FAFC",
                              whiteSpace: "nowrap",
                              textTransform: "uppercase",
                              letterSpacing: "0.07em",
                            }}
                          >
                            {skill?.label}
                          </span>
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 14 14"
                            fill="none"
                            style={{ flexShrink: 0 }}
                          >
                            <path
                              d="M7 0L8.4 5.6L14 7L8.4 8.4L7 14L5.6 8.4L0 7L5.6 5.6L7 0Z"
                              fill="#439BEA"
                            />
                          </svg>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tools.length > 0 && (
          <div style={{ maxWidth: 1400, margin: "0 auto", perspective: 700 }}>
            <div style={{ margin: "0 -80px" }}>
              <div
                style={{
                  transform: "rotate(2.5deg) rotateX(-10deg)",
                  transformOrigin: "center top",
                  background: "linear-gradient(180deg, #60a5fa 0%, #3b82f6 45%, #1d4ed8 100%)",
                  padding: "14px 0",
                  overflow: "hidden",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.25)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 40,
                    width: "max-content",
                    animation: "designer-tools-rtl 32s linear infinite",
                  }}
                >
                  {[0, 1].map((copy) => (
                    <div
                      key={copy}
                      style={{ display: "flex", gap: 40, alignItems: "center", flexShrink: 0 }}
                    >
                      {repeatedTools.map((tool, j) => (
                        <div
                          key={j}
                          style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}
                        >
                          <img
                            src={tool?.image || "/assets/svgs/default-tools.svg"}
                            alt={tool?.label || tool?.name || ""}
                            style={{
                              width: 22,
                              height: 22,
                              objectFit: "contain",
                              filter: "brightness(0) invert(1)",
                            }}
                          />
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: "#FFFFFF",
                              whiteSpace: "nowrap",
                              textTransform: "uppercase",
                              letterSpacing: "0.07em",
                            }}
                          >
                            {tool?.label || tool?.name}
                          </span>
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 14 14"
                            fill="none"
                            style={{ flexShrink: 0 }}
                          >
                            <path
                              d="M7 0L8.4 5.6L14 7L8.4 8.4L7 14L5.6 8.4L0 7L5.6 5.6L7 0Z"
                              fill="white"
                              fillOpacity="0.45"
                            />
                          </svg>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isEditing && skills.length === 0 && tools.length === 0 && (
        <div className="flex justify-center gap-3 px-6 text-center">
          <button
            onClick={() => openSidebar(sidebars.skills)}
            className="rounded-full border border-dashed border-black/15 px-5 py-2.5 text-[13px] font-medium text-[#7A736C] hover:border-black/25"
          >
            Add skills
          </button>
          <button
            onClick={() => openSidebar(sidebars.tools)}
            className="rounded-full border border-dashed border-black/15 px-5 py-2.5 text-[13px] font-medium text-[#7A736C] hover:border-black/25"
          >
            Add tools
          </button>
        </div>
      )}
    </div>
  );
}
