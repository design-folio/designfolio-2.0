import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { Button } from "./ui/buttonNew";
import Dropdown from "./dropdown";
import Text from "./text";
import AnalyticsChart from "./analyticsChart";
import { useGlobalContext } from "@/context/globalContext";
import MemoLeftArrow from "./icons/LeftArrow";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      type: "spring",
    },
  },
};

const itemVariants = {
  hidden: { y: 50 },
  visible: {
    y: 0,
    transition: {
      type: "spring",
      stiffness: 180,
      damping: 15,
      duration: 0.4,
    },
  },
};

function Analytics({ }) {
  const router = useRouter();
  const [duration, setDuration] = useState("Week");
  const [uniqueVisits, setUniqueVisits] = useState(0);

  const { userDetails, userDetailLoading } = useGlobalContext();
  const handleBack = () => {
    router.push("/builder");
  };

  const onDropDownChange = (item) => {
    setDuration(item);
  };

  return (
    <motion.div
      className="flex flex-col gap-4 md:gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <section className={cn("bg-df-section-card-bg-color shadow-df-section-card-shadow rounded-[24px] p-4 lg:p-[32px] break-words")}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center">
              <Button
                onClick={handleBack}
                variant="secondary"
                className="rounded-full px-4 h-9 text-sm font-medium "
              >
                <MemoLeftArrow className="!size-2.5" />
                Back to Builder
              </Button>
            </div>

            <div className="flex items-center justify-between mt-1">
              <div className="flex flex-col">
                <h1 className="text-[28px] md:text-[39px] font-inter font-[500] leading-[130%] text-df-heading-color">
                  Insights
                </h1>

                <div className="flex items-center gap-2 mt-2">
                  <p
                    className="text-analytics-profile-url-color text-[14px] font-[500] font-sfpro underline underline-offset-4 cursor-pointer"
                    onClick={() =>
                      window.open(
                        `https://${userDetails.username}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}`,
                        "_blank"
                      )
                    }
                  >
                    {userDetails?.username
                      ? userDetails?.username
                      : "hastobefixed"}
                    .{process.env.NEXT_PUBLIC_BASE_DOMAIN}
                  </p>
                </div>
              </div>

              <div className="self-center">
                {" "}
                <Dropdown
                  data={["Week", "Today", "This Month"]}
                  defaultValue={"Week"}
                  theme={"light"}
                  onClick={onDropDownChange}
                />
              </div>
            </div>

            <div
              className={`bg-review-card-bg-color p-[16px] border flex flex-col justify-between border-review-card-border-color rounded-[16px]`}
            >
              <h1 className="text-[20px] md:text-[39px] font-inter font-[500] leading-[130%] text-df-heading-color">
                {uniqueVisits}
              </h1>

              <Text
                size="p-xsmall"
                className="text-analytics-last-updated-color mt-2"
              >
                Unique Visitors
              </Text>
            </div>

            <AnalyticsChart
              duration={duration}
              setUniqueVisits={setUniqueVisits}
            ></AnalyticsChart>
          </div>
        </section>
      </motion.div>
    </motion.div>
  );
}

export default Analytics;
