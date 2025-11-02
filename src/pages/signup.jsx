import Seo from "@/components/seo";
import React from "react";
import { getServerSideProps as getAuthServerSideProps } from "@/lib/authServerSideProps";
import Signup from "@/components/signup";

export default function Index() {
  return (
    <div className="bg-background-landing min-h-screen overflow-hidden">
      <Seo
        title={"Designfolio - Build your Design Portfolio Website super Fast"}
        description={
          "Effortlessly create a professional online design portfolio to showcase your work. Begin building your dream portfolio today."
        }
        keywords={`ui ux design portfolio, graphic design portfolio, design portfolio, portfolio website, product design portfolio website`}
        author={`Designfolio`}
        imageUrl={"https://designfolio.me/images/png/designfolio-thumbnail.png"}
        url={`https://designfolio.me`}
      />
      <main>
        <Signup />
      </main>
    </div>
  );
}

Index.theme = "light";

export async function getServerSideProps(context) {
  const baseProps = await getAuthServerSideProps(context);

  return {
    ...baseProps,
    props: {
      ...baseProps.props,
      hideHeader: true,
    },
  };
}

