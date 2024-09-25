import ProjectPreview from "@/components/projectPreview";
import React from "react";

export default function Index() {
  return (
    <main className="min-h-screen bg-df-bg-color">
      <div className={`max-w-[890px] mx-auto py-[40px] px-2 md:px-4 lg:px-0`}>
        <ProjectPreview />
      </div>
    </main>
  );
}

export const getServerSideProps = async (context) => {
  const dfToken = context.req.cookies["df-token"] || null;
  if (!dfToken) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
  return {
    props: { dfToken: !!dfToken, hideHeader: true },
  };
};
