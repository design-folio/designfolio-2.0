import AnalyzeTool from "@/components/analyzeTool";
import Button from "@/components/button";
import CaseStudyGenerator from "@/components/caseStudyGenerator";
import EmailGenerator from "@/components/EmailGenerator";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

const navigation = {
  caseStudy: "case-study-generator",
  analyze: "analyze-case-study",
  email: "email-generator",
};

export default function Index() {
  const router = useRouter();
  console.log(router?.query?.type);
  useEffect(() => {
    document.body.style.overflowY = "auto";
  }, []);

  const content = () => {
    switch (router.query?.type) {
      case navigation.caseStudy:
        return <CaseStudyGenerator />;
      case navigation.analyze:
        return <AnalyzeTool />;
      case navigation.email:
        return <EmailGenerator />;
      default:
        return <CaseStudyGenerator />;
    }
  };

  return (
    <main className="bg-[#DBDBD6] min-h-screen">
      <div className="flex gap-[48px] h-screen">
        {/* Sidebar */}
        <div className="w-[280px] bg-[#F2F2F0] p-4 flex flex-col">
          {/* Scrollable content in sidebar */}
          <div className="flex-1 overflow-y-auto hide-scrollbar">
            <Link href={"/"}>
              <img
                src="/assets/svgs/logo.svg"
                alt="designfolio"
                className="cursor-pointer"
              />
            </Link>
            <ul className="mt-[32px]">
              <li className="mb-2">
                <Link href={`/ai-tools?type=${navigation.caseStudy}`}>
                  <Button
                    text={"Case Study Generator"}
                    type="tools"
                    icon={<img src="/assets/svgs/caseStudyToolIcon.svg" />}
                    customClass="w-full justify-start"
                    isSelected={router?.query?.type === navigation.caseStudy}
                    isDisabled
                  />
                </Link>
              </li>
              <li className="mb-2">
                <Link href={`/ai-tools?type=${navigation.analyze}`}>
                  <Button
                    text={"Analyze Case Study"}
                    type="tools"
                    icon={<img src="/assets/svgs/startTool.svg" />}
                    customClass="w-full justify-start"
                    isSelected={router?.query?.type === navigation.analyze}
                    isDisabled
                  />
                </Link>
              </li>
              <li className="mb-2">
                <Button
                  text={"Mock Interview"}
                  type="tools"
                  icon={<img src="/assets/svgs/mockTool.svg" />}
                  customClass="w-full justify-start"
                  isDisabled
                />
              </li>
              <li className="mb-2">
                <Link href={`/ai-tools?type=${navigation.email}`}>
                  <Button
                    text={"Email Generator"}
                    type="tools"
                    icon={<img src="/assets/svgs/email.svg" />}
                    customClass="w-full justify-start"
                    isSelected={router?.query?.type === navigation.email}
                  />
                </Link>
              </li>
              <li className="mb-2">
                <Button
                  text={"Cover Letter Generator"}
                  type="tools"
                  icon={<img src="/assets/svgs/coverTool.svg" />}
                  customClass="w-full justify-start"
                  isDisabled
                />
              </li>
              <li className="mb-2">
                <Button
                  text={"Optimize LinkedIn"}
                  type="tools"
                  icon={<img src="/assets/svgs/linkedinTool.svg" />}
                  customClass="w-full justify-start"
                  isDisabled
                />
              </li>
              <li className="mb-2">
                <Button
                  text={"Personal Branding"}
                  type="tools"
                  icon={<img src="/assets/svgs/personalTool.svg" />}
                  customClass="w-full justify-start"
                  isDisabled
                />
              </li>
              <li className="mb-2">
                <Button
                  text={"Skill Gap Identifier"}
                  type="tools"
                  icon={<img src="/assets/svgs/skillTool.svg" />}
                  customClass="w-full justify-start"
                  isDisabled
                />
              </li>
              <li className="mb-2">
                <Button
                  text={"Salary negotiator"}
                  type="tools"
                  icon={<img src="/assets/svgs/walletTool.svg" />}
                  customClass="w-full justify-start"
                  isDisabled
                />
              </li>
            </ul>
          </div>
          {/* Fixed Footer in Sidebar */}
          <div className="h-30  mt-auto">
            <Button
              text={"Portfolio Builder"}
              type="tertiary"
              customClass="!p-4 mr-0 w-full"
              icon={
                <img
                  src="/assets/svgs/power.svg"
                  alt="launch builder"
                  className="cursor-pointer"
                />
              }
              animation
            />
            <Button
              type="ai"
              text={"0/8 Credits - Per Day"}
              style={{ background: "var(--ai-btn-bg-color)" }}
              customClass="w-full mt-5"
            />
          </div>
        </div>
        {/* Main Content Area */}
        <div className="flex-1 p-6 max-h-screen overflow-auto">{content()}</div>
      </div>
    </main>
  );
}

Index.theme = "light";

export const getServerSideProps = async (context) => {
  return {
    props: {
      hideHeader: true,
    },
  };
};
