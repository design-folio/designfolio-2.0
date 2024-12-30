import React from "react";
import Text from "./text";

export default function AnalyzeEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="flex items-center justify-center">
        <img src="/assets/svgs/binocular.svg" alt="binocular" />
      </div>
      <div className="mt-5">
        <Text size="p-medium" className="text-[#595959] font-bold text-center">
          Analyze your case study
        </Text>
        <Text size="p-xsmall" className="text-[#595959] text-center mt-2">
          Start by adding text to the editor
        </Text>
      </div>
      <div className="flex flex-col gap-8 mt-[46px]">
        <div className="flex items-center gap-4">
          <img src="/assets/svgs/points.svg" alt="" />
          <Text size="p-xsmall" className="text-[#595959] mt-2">
            Paste your case study or import directly from Medium.
          </Text>
        </div>
        <div className="flex items-center gap-4">
          <img src="/assets/svgs/points.svg" alt="" />
          <Text size="p-xsmall" className="text-[#595959] mt-2">
            We’ll compare it against examples from top designers at Meta and
            Google.
          </Text>
        </div>
        <div className="flex items-center gap-4">
          <img src="/assets/svgs/points.svg" alt="" />
          <Text size="p-xsmall" className="text-[#595959] mt-2">
            In just 10 seconds, you’ll get a detailed scorecard with tips to
            improve.
          </Text>
        </div>
      </div>
    </div>
  );
}
