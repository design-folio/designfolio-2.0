import BottomLayout from "@/components/bottomLayout";
import OthersPreview from "@/components/othersPreview";
import Profile from "@/components/profile";
import Projects from "@/components/Projects";
import Reviews from "@/components/reviews";
import Tools from "@/components/tools";
import Works from "@/components/works";
import { useGlobalContext } from "@/context/globalContext";
import { _getUser } from "@/network/get-request";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect } from "react";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1, // Children animations start at the same time but staggered
      type: "spring",
    },
  },
};

const itemVariants = {
  hidden: { y: 50 }, // Starting position of children below their final position
  visible: {
    y: 0, // Final position of children
    transition: {
      type: "spring",
      stiffness: 150, // Smoothness adjusted
      damping: 15, // Controlled bounciness
      duration: 0.5, // Duration of each child's animation
    },
  },
};
export default function Index({ initialUserDetails }) {
  const { setTheme } = useTheme();
  const router = useRouter();
  const { data: userDetails } = useQuery({
    queryKey: [`portfolio-${router.query.id}`],
    queryFn: _getUser(router.query.id),
    initialData: initialUserDetails,
  });
  const { projectRef } = useGlobalContext();

  useEffect(() => {
    if (userDetails) {
      setTheme(userDetails?.theme == 1 ? "dark" : "light");
    }
  }, [userDetails, setTheme]);

  return (
    <BottomLayout>
      <main className="min-h-screen bg-df-bg-color">
        <div
          className={`max-w-[890px] mx-auto py-[40px] px-2 md:px-4 lg:px-0 pb-[140px]`}
        >
          {userDetails && (
            <motion.div
              className="flex-1 flex flex-col gap-4 md:gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <Profile userDetails={userDetails} />
              </motion.div>

              {userDetails?.projects?.length > 0 && (
                <motion.div variants={itemVariants}>
                  <Projects userDetails={userDetails} projectRef={projectRef} />
                </motion.div>
              )}
              {userDetails?.reviews?.length > 0 && (
                <motion.div variants={itemVariants}>
                  <Reviews userDetails={userDetails} />
                </motion.div>
              )}
              <Tools userDetails={userDetails} />
              {userDetails?.experiences?.length > 0 && (
                <motion.div variants={itemVariants}>
                  <Works userDetails={userDetails} />
                </motion.div>
              )}
              {(!!userDetails?.socials?.instagram ||
                !!userDetails?.socials?.twitter ||
                !!userDetails?.socials?.linkedin ||
                !!userDetails?.portfolios?.dribbble ||
                !!userDetails?.portfolios?.notion ||
                !!userDetails?.portfolios?.behance ||
                !!userDetails?.portfolios?.medium) && (
                <motion.div variants={itemVariants}>
                  <OthersPreview userDetails={userDetails} />
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </BottomLayout>
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
