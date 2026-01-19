import { FloatingNav } from "@/components/comp/FloatingNav";
import { Footer } from "@/components/comp/Footer";
import { Hero } from "@/components/comp/Hero";
import { Spotlight } from "@/components/comp/Spotlight";
import { Testimonials } from "@/components/comp/Testimonials";
import { ToolStack } from "@/components/comp/ToolStack";
import { WorkShowcase } from "@/components/comp/WorkShowcase";
import { useGlobalContext } from "@/context/globalContext";
import { DEFAULT_SECTION_ORDER } from "@/lib/constant";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

const Minimal = ({ userDetails, edit }) => {
  const { setCursor } = useGlobalContext();
  useEffect(() => {
    setCursor(userDetails?.cursor ? userDetails?.cursor : 0);
  }, []);

  // Get section order from userDetails or use template default
  const _raw = userDetails?.sectionOrder;
  const _defaultOrder = DEFAULT_SECTION_ORDER;
  const _filtered = _raw && Array.isArray(_raw) && _raw.length > 0 ? _raw.filter(section => _defaultOrder.includes(section)) : null;
  const sectionOrder = _raw && Array.isArray(_raw) && _raw.length > 0 && _filtered && _filtered.length > 0
    ? _filtered
    : _defaultOrder;

  // Section component mapping
  const sectionComponents = {
    projects: (userDetails?.projects?.length != 0 || edit) && (
      <section id="section-projects">
        <WorkShowcase userDetails={userDetails} edit={edit} />
      </section>
    ),
    tools: (
      <section id="section-tools">
        <ToolStack userDetails={userDetails} edit={edit} />
      </section>
    ),
    works: (userDetails?.experiences?.length != 0 || edit) && (
      <section id="section-works">
        <Spotlight userDetails={userDetails} edit={edit} />
      </section>
    ),
    reviews: (userDetails?.reviews?.length != 0 || edit) && (
      <section id="section-reviews">
        <Testimonials userDetails={userDetails} edit={edit} />
      </section>
    ),
  };

  return (
    <>
      <div className={cn("min-h-screen bg-background text-foreground rounded-2xl", userDetails?.wallpaper && userDetails?.wallpaper?.value != 0 && "")}>
        <div className="fixed top-8 left-8 z-50">{/* <ThemeToggle /> */}</div>
        <div className={cn("container max-w-3xl mx-auto px-4", userDetails?.wallpaper && userDetails?.wallpaper?.value != 0 && "my-8")}>
          <section id="hero">
            <Hero userDetails={userDetails} edit={edit} />
          </section>
          {sectionOrder.map((sectionId) => sectionComponents[sectionId])}

          {(edit || userDetails?.resume?.url || userDetails?.socials?.instagram ||
            userDetails?.socials?.twitter ||
            userDetails?.socials?.linkedin ||
            userDetails?.portfolios?.dribbble ||
            userDetails?.portfolios?.notion ||
            userDetails?.portfolios?.behance ||
            userDetails?.portfolios?.medium) && (
              <section id="footer">
                <Footer userDetails={userDetails} edit={edit} />
              </section>
            )}
        </div>
      </div>
      <FloatingNav />
    </>
  );
};

export default Minimal;

// Minimal.theme = "dark";

export const getServerSideProps = async (context) => {
  return {
    props: {
      hideHeader: true,
    },
  };
};
