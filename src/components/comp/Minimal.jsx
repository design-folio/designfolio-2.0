import { FloatingNav } from "@/components/comp/FloatingNav";
import { Footer } from "@/components/comp/Footer";
import { Hero } from "@/components/comp/Hero";
import { Spotlight } from "@/components/comp/Spotlight";
import { Testimonials } from "@/components/comp/Testimonials";
import { ToolStack } from "@/components/comp/ToolStack";
import { WorkShowcase } from "@/components/comp/WorkShowcase";
import { useGlobalContext } from "@/context/globalContext";
import { useEffect } from "react";

const Minimal = ({ userDetails, edit }) => {
  const { setCursor } = useGlobalContext();
  useEffect(() => {
    setCursor(userDetails?.cursor ? userDetails?.cursor : 0);
  }, []);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed top-8 left-8 z-50">{/* <ThemeToggle /> */}</div>
      <div className="container max-w-3xl mx-auto px-4">
        <section id="hero">
          <Hero userDetails={userDetails} edit={edit} />
        </section>
        {(userDetails?.projects?.length != 0 || edit) && (
          <section id="featured-projects">
            <WorkShowcase userDetails={userDetails} edit={edit} />
          </section>
        )}
        <section id="tools">
          <ToolStack userDetails={userDetails} edit={edit} />
        </section>
        {(userDetails?.experiences?.length != 0 || edit) && (
          <section id="work-experience">
            <Spotlight userDetails={userDetails} edit={edit} />
          </section>
        )}

        {(userDetails?.reviews?.length != 0 || edit) && (
          <section id="testimonials">
            <Testimonials userDetails={userDetails} edit={edit} />
          </section>
        )}

        <Footer userDetails={userDetails} edit={edit} />
      </div>
      <FloatingNav />
    </div>
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
