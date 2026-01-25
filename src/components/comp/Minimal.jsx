import { FloatingNav } from "@/components/comp/FloatingNav";
import { Footer } from "@/components/comp/Footer";
import { Hero } from "@/components/comp/Hero";
import { Spotlight } from "@/components/comp/Spotlight";
import { Testimonials } from "@/components/comp/Testimonials";
import { ToolStack } from "@/components/comp/ToolStack";
import { WorkShowcase } from "@/components/comp/WorkShowcase";
import { useGlobalContext } from "@/context/globalContext";
import { DEFAULT_SECTION_ORDER, normalizeSectionOrder } from "@/lib/constant";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import AboutMe from "@/components/aboutMe";

const Minimal = ({ userDetails, edit }) => {
  const { setCursor, openModal } = useGlobalContext();
  useEffect(() => {
    setCursor(userDetails?.cursor ? userDetails?.cursor : 0);
  }, []);

  // Get section order from userDetails or use template default
  const sectionOrder = normalizeSectionOrder(userDetails?.sectionOrder, DEFAULT_SECTION_ORDER);

  // Section component mapping
  const sectionComponents = {
    about: (
      <section id="section-about">
        <AboutMe userDetails={userDetails} edit={edit} openModal={openModal} />
      </section>
    ),
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
