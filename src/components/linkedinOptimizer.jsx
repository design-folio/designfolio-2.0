import React from "react";
import Text from "./text";
import LinkedInForm from "./LinkedInForm";

export default function LinkedinOptimizer() {
  return (
    <div className="container mx-auto max-w-3xl">
      <div className="text-center mb-12" id="initial-title">
        <Text
          size="p-large"
          className="text-center text-[#202937] font-satoshi"
        >
          LinkedIn Strategy Generator
        </Text>
        <Text
          size="p-small"
          className="text-center text-[#475569] font-medium mt-4"
        >
          See how your resume stacks up against the Job Description.
        </Text>
      </div>
      <div className="bg-white shadow-tools border border-[#E5E7EB] rounded-3xl p-6">
        <LinkedInForm />
      </div>
    </div>
  );
}
