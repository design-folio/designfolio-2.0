import AnalyzeTool from "@/components/analyzeTool";
import Button from "@/components/button";
import CaseStudyGenerator from "@/components/caseStudyGenerator";
import EmailGenerator from "@/components/emailGenerator";
import MockInterviewTool from "@/components/mockInterviewTool";
import OfferTool from "@/components/offerTool";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

const navigation = {
  caseStudy: "case-study-generator",
  analyze: "analyze-case-study",
  email: "email-generator",
  salary: "salary-negotiator",
  MockInterview: "mock-interview",
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
      case navigation.salary:
        return <OfferTool />;
      case navigation.MockInterview:
        return <MockInterviewTool />;
      default:
        return <CaseStudyGenerator />;
    }
  };

  const goToBuilder = () => {
    const token = Cookies.get("df-token");
    if (token) {
      router.push("/portfolio-builder");
    } else {
      router.push("/claim-link");
    }
  };

  return (
    <main className="bg-[#DBDBD6] lg:min-h-screen">
      <div className="flex  lg:h-screen">
        {/* Sidebar */}
        <div className=" hidden lg:flex w-[280px] bg-[#F2F2F0] p-4  flex-col">
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
                <Link href={`/ai-tools?type=${navigation.MockInterview}`}>
                  <Button
                    text={"Mock Interview"}
                    type="tools"
                    icon={<img src="/assets/svgs/mockTool.svg" />}
                    customClass="w-full justify-start"
                    isSelected={
                      router?.query?.type === navigation.MockInterview
                    }
                  />
                </Link>
              </li>
              <li className="mb-2">
                <Link href={`/ai-tools?type=${navigation.salary}`}>
                  <Button
                    text={"Salary negotiator"}
                    type="tools"
                    icon={<img src="/assets/svgs/walletTool.svg" />}
                    customClass="w-full justify-start"
                    isSelected={router?.query?.type === navigation.salary}
                  />
                </Link>
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
              onClick={goToBuilder}
            />
            {/* <Button
              type="ai"
              text={"0/8 Credits - Per Day"}
              style={{ background: "var(--ai-btn-bg-color)" }}
              customClass="w-full mt-5"
            /> */}
          </div>
        </div>
        {/* Main Content Area */}
        <div className="flex-1 p-6 lg:max-h-screen lg:overflow-auto">
          {content()}
        </div>
      </div>
    </main>
  );
}

Index.theme = "light";
