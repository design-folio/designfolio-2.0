import Seo from "@/components/seo";
import React from "react";
import VerifyEmail from "@/components/verifyEmail";
import ChangeEmail from "@/components/changeEmail";
import { useRouter } from "next/router";

export default function Index() {
  const router = useRouter();
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
        {router?.query?.change == "email" ? <ChangeEmail /> : <VerifyEmail />}
      </main>
    </div>
  );
}

Index.theme = "light";

export const getServerSideProps = async (context) => {
  const dfToken = context.req.cookies["df-token"] || null;
  if (!dfToken) {
    return {
      redirect: {
        destination: "/builder",
        permanent: false,
      },
    };
  }
  return {
    props: { hideHeader: true, dfToken: !!dfToken },
  };
};



