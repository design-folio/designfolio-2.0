import Seo from "@/components/seo";
import React from "react";
import { getServerSideProps } from "@/lib/authServerSideProps";
import Login from "@/components/login";

export default function Index() {
  return (
    <div className="bg-landing-bg-color min-h-screen">
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
      <main className={"pt-[64px] md:pt-[104px] pb-5"}>
        <Login />
      </main>
    </div>
  );
}

Index.theme = "light";

export { getServerSideProps };
