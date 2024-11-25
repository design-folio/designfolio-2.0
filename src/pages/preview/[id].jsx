import { _getUser } from "@/network/get-request";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import Seo from "@/components/seo";
import { capitalizeWords } from "@/lib/capitalizeText";
import Template1 from "@/components/template";
import Template2 from "@/components/template2";
import BottomNavigation from "@/components/bottomNavigation";

export default function Index({ initialUserDetails }) {
  const { setTheme } = useTheme();
  const router = useRouter();
  const { data: userDetails } = useQuery({
    queryKey: [`portfolio-${router.query.id}`],
    queryFn: _getUser(router.query.id),
    initialData: initialUserDetails,
  });

  useEffect(() => {
    if (userDetails) {
      setTheme(userDetails?.theme == 1 ? "dark" : "light");
    }
  }, [userDetails, setTheme]);

  const renderTemplate = () => {
    console.log(userDetails?.template);
    switch (userDetails?.template) {
      case 0:
        return <Template1 userDetails={userDetails} />;
      case 1:
        return (
          <>
            <Template2 userDetails={userDetails} />
            <BottomNavigation
              userDetails={userDetails}
              className="bg-gradient-to-t from-transparent top-0 pt-5"
              watermarkClassName="!top-7"
            />
          </>
        );

      default:
        return <Template1 userDetails={userDetails} />;
    }
  };

  return (
    <>
      <Seo
        title={capitalizeWords(userDetails?.username)}
        description={userDetails?.introduction}
        keywords={`${userDetails?.skillsString}`}
        author={`${userDetails?.firstName} ${userDetails?.lastName}`}
        imageUrl={userDetails?.avatar?.url ?? "/assets/png/seo-profile.png"}
        url={`https://${userDetails?.username}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}`}
      />
      <main className="min-h-screen bg-df-bg-color">
        <div
          className={`max-w-[890px] mx-auto py-[40px] px-2 md:px-4 lg:px-0 pb-[140px]`}
        >
          {" "}
          {userDetails && renderTemplate()}
        </div>
      </main>
    </>
  );
}

export const getServerSideProps = async (context) => {
  const { id } = context.query;
  try {
    const userResponse = await _getUser(id);
    const user = userResponse?.data?.user;
    if (user) {
      return {
        props: {
          initialUserDetails: user,
          hideHeader: true,
        },
      };
    } else {
      // If no user is found, redirect or handle accordingly
      return {
        redirect: {
          destination: "https://designfolio.me",
          permanent: false,
        },
      };
    }
  } catch (error) {
    // Handle the error or redirect if necessary
    return {
      redirect: {
        destination: "https://designfolio.me",
        permanent: false,
      },
    };
  }
};
