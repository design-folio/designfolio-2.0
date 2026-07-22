import { Pencil } from "lucide-react";
import { useGlobalContext } from "@/context/globalContext";
import { sidebars } from "@/lib/constant";
import { SectionVisibilityButton } from "@/components/section";
import { Button } from "@/components/ui/button";
import DesignerAboutPegboard from "./DesignerAboutPegboard";

export default function DesignerAbout({ isEditing }) {
  const { userDetails, openSidebar } = useGlobalContext();
  const hasAbout = userDetails?.about !== null && userDetails?.about !== undefined;
  const { firstName, about } = userDetails || {};
  const description = about?.description?.trim() || "";

  if (!isEditing && !hasAbout) return null;

  return (
    <div className="pt-16 pb-4">
      <div className="mb-6 flex items-center gap-3">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
          <path d="M7 0L8.4 5.6L14 7L8.4 8.4L7 14L5.6 8.4L0 7L5.6 5.6L7 0Z" fill="#3B82F6" />
        </svg>
        <span className="designer-script text-[22px] font-bold tracking-[0.04em] text-[#439BEA]">
          About me
        </span>
        <div className="h-px flex-1 bg-[#E2E8F0]" />
        {isEditing && (
          <div className="flex flex-shrink-0 gap-2">
            <SectionVisibilityButton
              sectionId="about"
              className="h-8 w-8 rounded-full border border-[#E2E8F0] bg-white shadow-sm hover:bg-gray-50"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => openSidebar(sidebars.about)}
              className="h-8 w-8 rounded-full border-[#E2E8F0] bg-white p-0 shadow-sm hover:bg-gray-50"
              aria-label="Edit about"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-10 md:flex-row md:gap-16">
        <div className="w-full flex-shrink-0 md:w-[45%]">
          <DesignerAboutPegboard images={about?.pegboardImages} />
        </div>

        <div className="min-w-0 flex-1">
          <h2
            className="designer-heading mb-6 text-[#0F172A]"
            style={{
              fontSize: "clamp(26px, 3.5vw, 44px)",
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
            }}
          >
            a little about myself
          </h2>

          {description ? (
            <p className="mb-4 text-[15px] leading-[1.75] whitespace-pre-wrap text-[#475569]">
              {description}
            </p>
          ) : (
            isEditing && (
              <Button
                variant="link"
                onClick={() => openSidebar(sidebars.about)}
                className="mb-4 h-auto justify-start p-0 text-[13px] font-normal text-[#7A736C] no-underline hover:text-[#1A1A1A] hover:no-underline"
              >
                Click here to add your story...
              </Button>
            )
          )}

          {firstName && (
            <span className="designer-script text-[32px] font-semibold text-[#439BEA]">
              {firstName}.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
