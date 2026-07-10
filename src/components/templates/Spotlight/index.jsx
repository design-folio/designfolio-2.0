import { SpotlightFloatingNav } from "./SpotlightFloatingNav";
import { SpotlightFooter } from "./SpotlightFooter";
import { SpotlightHero } from "./SpotlightHero";
import { SpotlightWorksSection } from "./SpotlightWorksSection";
import { SpotlightTestimonialsSection } from "./SpotlightTestimonialsSection";
import { SpotlightToolsSection } from "./SpotlightToolsSection";
import { SpotlightProjectsSection } from "./SpotlightProjectsSection";
import { useGlobalContext } from "@/context/globalContext";
import { DEFAULT_SECTION_ORDER, normalizeSectionOrder, sidebars } from "@/lib/constant";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { AboutMeContent } from "@/components/aboutMe";
import { Button as ButtonNew } from "@/components/ui/buttonNew";
import { SectionVisibilityButton } from "@/components/section";
import { PencilIcon } from "lucide-react";

const Spotlight = ({ userDetails, edit }) => {
  const { setCursor, openSidebar, containerMaxWidth, isHeaderMode } = useGlobalContext();
  useEffect(() => {
    setCursor(userDetails?.cursor ? userDetails?.cursor : 0);
  }, [setCursor, userDetails?.cursor]);

  const hasAbout = userDetails?.about !== null && userDetails?.about !== undefined;

  // Get section order from userDetails or use template default
  const sectionOrder = normalizeSectionOrder(userDetails?.sectionOrder, DEFAULT_SECTION_ORDER);

  // Get hidden sections array (only applied in preview; builder always shows all sections)
  const hiddenSections = userDetails?.hiddenSections || [];
  const isSectionVisible = (id) => edit || !hiddenSections.includes(id);

  // Section component mapping
  const sectionComponents = {
    about: isSectionVisible("about") && (edit || hasAbout) && (
      <section id="section-about" className="py-12">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="flex-1 text-2xl font-bold">About</h2>
          {edit && (
            <div className="flex items-center justify-end gap-2">
              <SectionVisibilityButton sectionId="about" />
              <ButtonNew
                variant="secondary"
                size="icon"
                className="h-11 w-11 rounded-full"
                onClick={() => openSidebar?.(sidebars.about)}
              >
                <PencilIcon className="text-df-icon-color h-4 w-4" />
              </ButtonNew>
            </div>
          )}
        </div>
        <AboutMeContent
          userDetails={userDetails}
          edit={edit}
          variant="pegboard"
          textClassName="text-muted-foreground"
        />
      </section>
    ),
    projects: isSectionVisible("projects") && (userDetails?.projects?.length != 0 || edit) && (
      <section id="section-projects">
        <SpotlightProjectsSection
          userDetails={userDetails}
          edit={edit}
          headerActions={edit ? <SectionVisibilityButton sectionId="projects" /> : null}
        />
      </section>
    ),
    tools: isSectionVisible("tools") && (
      <section id="section-tools">
        <SpotlightToolsSection
          userDetails={userDetails}
          edit={edit}
          headerActions={edit ? <SectionVisibilityButton sectionId="tools" /> : null}
        />
      </section>
    ),
    works: isSectionVisible("works") && (userDetails?.experiences?.length != 0 || edit) && (
      <section id="section-works">
        <SpotlightWorksSection
          userDetails={userDetails}
          edit={edit}
          headerActions={edit ? <SectionVisibilityButton sectionId="works" /> : null}
        />
      </section>
    ),
    reviews: isSectionVisible("reviews") && (userDetails?.reviews?.length != 0 || edit) && (
      <section id="section-reviews">
        <SpotlightTestimonialsSection
          userDetails={userDetails}
          edit={edit}
          headerActions={edit ? <SectionVisibilityButton sectionId="reviews" /> : null}
        />
      </section>
    ),
  };

  return (
    <>
      <div
        className={cn(
          "text-foreground mx-auto min-h-screen rounded-2xl",
          // Keep the card transparent in header mode so the wallpaper band shows behind the top.
          !isHeaderMode && "bg-background"
        )}
        style={{ maxWidth: containerMaxWidth ?? 848 }}
      >
        <div className="fixed top-8 left-8 z-50">{/* <ThemeToggle /> */}</div>
        <div
          className={cn(
            "container mx-auto max-w-3xl px-4",
            userDetails?.wallpaper && userDetails?.wallpaper?.value != 0 && "my-8"
          )}
        >
          <section id="hero">
            <SpotlightHero userDetails={userDetails} edit={edit} />
          </section>
          {sectionOrder.map((sectionId) => sectionComponents[sectionId])}

          {(edit ||
            userDetails?.resume?.url ||
            userDetails?.socials?.instagram ||
            userDetails?.socials?.twitter ||
            userDetails?.socials?.linkedin ||
            userDetails?.portfolios?.dribbble ||
            userDetails?.portfolios?.notion ||
            userDetails?.portfolios?.medium) && (
            <section id="footer">
              <SpotlightFooter userDetails={userDetails} edit={edit} />
            </section>
          )}
        </div>
      </div>
      <SpotlightFloatingNav />
    </>
  );
};

export default Spotlight;

export const getServerSideProps = async (context) => {
  return {
    props: {
      hideHeader: true,
    },
  };
};
