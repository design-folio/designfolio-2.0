import { useGlobalContext } from "@/context/globalContext";
import DesignerHero from "./DesignerHero";
import DesignerSelectedWork from "./DesignerSelectedWork";
import DesignerExperience from "./DesignerExperience";
import DesignerAbout from "./DesignerAbout";
import DesignerRecommendations from "./DesignerRecommendations";
import DesignerSkillsTools from "./DesignerSkillsTools";
import DesignerContact from "./DesignerContact";
import DesignerGreetingCursor from "./DesignerGreetingCursor";

/**
 * Designer template — art-directed, fixed section order (see DEFAULT_SECTION_ORDER
 * for the shared key names). Section order is intentionally not reorderable here;
 * only visibility (hiddenSections) is honored, same as every other template.
 */
export default function Designer({ isEditing = false, preview = false, publicView = false }) {
  const { userDetails, containerMaxWidth } = useGlobalContext();
  const hiddenSections = userDetails?.hiddenSections || [];
  const isSectionVisible = (id) => isEditing || !hiddenSections.includes(id);

  return (
    <div className="relative">
      {!isEditing && <DesignerGreetingCursor />}

      {/* `fixed` (not `absolute`) so this sizes to the true viewport rather than the
          nearest positioned ancestor — see the comment on .designer-dotted-grid in
          designer.css for why that distinction matters inside the builder. */}
      <div
        className="designer-dotted-grid pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
      />

      {/* Hero is intentionally full-bleed (breaks out of the max-width column) so the sky/clouds fill the viewport width, matching the rest of the app's full-bleed marquee convention. */}
      <div
        className="relative z-10"
        style={{ marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)", width: "100vw" }}
      >
        <DesignerHero isEditing={isEditing} />
      </div>

      <div
        className="relative z-10 mx-auto flex w-full flex-1 flex-col px-4 pb-8 md:px-0"
        style={{ maxWidth: containerMaxWidth ?? 880 }}
      >
        {isSectionVisible("projects") && (
          <section id="section-projects">
            <DesignerSelectedWork isEditing={isEditing} preview={preview} publicView={publicView} />
          </section>
        )}

        {isSectionVisible("works") && (
          <section id="section-works">
            <DesignerExperience isEditing={isEditing} />
          </section>
        )}

        {isSectionVisible("about") && (
          <section id="section-about">
            <DesignerAbout isEditing={isEditing} />
          </section>
        )}

        {isSectionVisible("reviews") && (
          <section id="section-reviews">
            <DesignerRecommendations isEditing={isEditing} />
          </section>
        )}

        {isSectionVisible("tools") && <DesignerSkillsTools isEditing={isEditing} />}

        <DesignerContact isEditing={isEditing} />
      </div>

      <div className="relative z-10" style={{ lineHeight: 0 }}>
        <img
          src="/assets/png/bottom-grass.png"
          alt=""
          aria-hidden="true"
          draggable={false}
          style={{ width: "100%", display: "block" }}
        />
      </div>
    </div>
  );
}

export const getServerSideProps = async () => {
  return {
    props: {
      hideHeader: true,
    },
  };
};
