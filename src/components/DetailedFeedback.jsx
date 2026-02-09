import { useRef } from "react";
import ProgressBar from "./ProgressBar";

const DetailedFeedback = ({ feedbackData }) => {
  const reportRef = useRef(null);

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-orange-500";
    return "text-red-500";
  };

  const handleDownloadPDF = () => {
    if (!reportRef.current) return;

    const buttons = reportRef.current.querySelectorAll(".action-buttons");
    buttons.forEach((button) => button.classList.add("hidden"));

    const options = {
      margin: 10,
      filename: "interview-feedback.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    const html2pdf = require("html2pdf.js");

    html2pdf()
      .set(options)
      .from(reportRef.current)
      .save()
      .then(() => {
        buttons.forEach((button) => button.classList.remove("hidden"));
      });
  };

  const handleStartOver = () => {
    window.location.reload();
  };

  return (
    <div className="w-full max-w-3xl space-y-6">
      <div className="flex flex-wrap gap-4 justify-center action-buttons">
        <button
          onClick={handleDownloadPDF}
          className="rounded-full border-2 border-foreground/20 bg-white/50 backdrop-blur-sm px-4 py-2 text-sm font-medium text-foreground hover:bg-foreground/10 transition-colors"
        >
          Download PDF
        </button>
        <button
          onClick={handleStartOver}
          className="rounded-full h-11 px-6 text-base font-semibold bg-foreground text-background hover:bg-foreground/90 transition-colors"
        >
          Start New Interview
        </button>
      </div>

      <div ref={reportRef}>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Interview Feedback Report</h2>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Interview Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="font-medium">Duration</p>
                <p>{feedbackData.interviewSummary.duration}</p>
              </div>
              <div>
                <p className="font-medium">Difficulty</p>
                <p>{feedbackData.interviewSummary.difficulty}</p>
              </div>
              <div>
                <p className="font-medium">Type</p>
                <p>{feedbackData.interviewSummary.type}</p>
              </div>
            </div>
          </div>

          {/* Overall Score */}
          <div className="mb-8">
            <div className="flex justify-center my-10">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">
                    {feedbackData.score}%
                  </span>
                </div>
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    className="text-primary"
                    strokeDasharray={351.86}
                    strokeDashoffset={
                      351.86 - (351.86 * feedbackData.score) / 100
                    }
                  />
                </svg>
              </div>
            </div>
            <p className="text-gray-700 text-center mt-4">
              {feedbackData.overallFeedback}
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Skill Analysis</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Technical Skills</h4>
                <p className="text-gray-700">
                  {feedbackData.skillAnalysis.technical}
                </p>
              </div>
              <div>
                <h4 className="font-medium">Domain Knowledge</h4>
                <p className="text-gray-700">
                  {feedbackData.skillAnalysis.domain}
                </p>
              </div>
              <div>
                <h4 className="font-medium">Methodology</h4>
                <p className="text-gray-700">
                  {feedbackData.skillAnalysis.methodology}
                </p>
              </div>
            </div>
          </div>

          {/* Soft Skills */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">
              Soft Skills Evaluation
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Communication</label>
                <ProgressBar
                  progress={feedbackData.softSkills.communication}
                  className="h-2 !mt-4"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Clarity and structure of responses
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">
                  Technical Articulation
                </label>
                <ProgressBar
                  progress={feedbackData.softSkills.articulation}
                  className="h-2"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Ability to explain technical concepts
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Problem Solving</label>
                <ProgressBar
                  progress={feedbackData.softSkills.problemSolving}
                  className="h-2"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Approach to solving complex problems
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">
                  Professional Communication
                </label>
                <ProgressBar
                  progress={feedbackData.softSkills.professionalCommunication}
                  className="h-2"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Tone and professionalism
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Adaptability</label>
                <ProgressBar
                  progress={feedbackData.softSkills.adaptability}
                  className="h-2"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Flexibility in approach
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">
                  Detail Orientation
                </label>
                <ProgressBar
                  progress={feedbackData.softSkills.detailOrientation}
                  className="h-2"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Thoroughness and precision
                </p>
              </div>
            </div>
          </div>

          {/* Strengths & Areas for Improvement */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-xl font-semibold text-green-600 mb-2">
                Strengths
              </h3>
              <ul className="list-disc pl-6">
                {feedbackData.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-orange-600 mb-2">
                Areas for Improvement
              </h3>
              <ul className="list-disc pl-6">
                {feedbackData.improvements.map((improvement, index) => (
                  <li key={index}>{improvement}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Question Analysis */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">
              Detailed Question Analysis
            </h3>
            {feedbackData.questionAnswers.map((qa, index) => (
              <div key={index} className="mb-6 p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">Question {index + 1}</h4>
                  <span
                    className={`px-2 py-1 rounded ${getScoreColor(
                      qa.score
                    )} bg-opacity-10`}
                  >
                    Score: {qa.score}
                  </span>
                </div>
                <p className="mb-2 font-medium">{qa.question}</p>
                <p className="mb-2 text-gray-600">
                  Your Answer: {qa.userAnswer}
                </p>
                <p className="text-sm text-gray-700">Feedback: {qa.feedback}</p>
                <p className="text-sm text-gray-700">
                  Communication Feedback: {qa.communicationFeedback}
                </p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-xl font-semibold text-blue-600 mb-4">
                Skill Recommendations
              </h3>
              <ul className="list-disc pl-6">
                {feedbackData.recommendations.skillBased.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-blue-600 mb-4">
                Resources
              </h3>
              <ul className="list-disc pl-6">
                {feedbackData.recommendations.resources.map(
                  (resource, index) => (
                    <li key={index}>{resource}</li>
                  )
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-blue-600 mb-4">
                Interview Tips
              </h3>
              <ul className="list-disc pl-6">
                {feedbackData.recommendations.interviewTips.map(
                  (tip, index) => (
                    <li key={index}>{tip}</li>
                  )
                )}
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t text-center">
            <a
              href="https://www.designfolio.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <svg
                width="139"
                height="32"
                viewBox="0 0 139 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto"
              >
                <path
                  d="M15.506 0L17.7725 10.0341L26.4703 4.54159L20.9779 13.2394L31.0119 15.506L20.9779 17.7725L26.4703 26.4703L17.7725 20.9779L15.506 31.0119L13.2394 20.9779L4.54159 26.4703L10.0341 17.7725L0 15.506L10.0341 13.2394L4.54159 4.54159L13.2394 10.0341L15.506 0Z"
                  fill="#FF553E"
                />
                <path
                  d="M44.337 23.259C41.5537 23.259 39.8215 21.2153 39.8215 18.2374C39.8215 15.2401 41.5732 13.0991 44.4732 13.0991C45.8162 13.0991 47.0034 13.6635 47.6068 14.6172V8.5252H49.9619V23.006H47.782L47.6263 21.5073C47.0424 22.6167 45.7967 23.259 44.337 23.259ZM44.8625 21.0791C46.5169 21.0791 47.5873 19.8918 47.5873 18.1596C47.5873 16.4273 46.5169 15.2206 44.8625 15.2206C43.2081 15.2206 42.196 16.4468 42.196 18.1596C42.196 19.8723 43.2081 21.0791 44.8625 21.0791ZM56.7379 23.259C53.8768 23.259 51.872 21.1764 51.872 18.1985C51.872 15.1817 53.8378 13.0991 56.66 13.0991C59.5406 13.0991 61.3702 15.026 61.3702 18.0233V18.7435L54.1298 18.7629C54.3049 20.4562 55.2003 21.3126 56.7768 21.3126C58.0808 21.3126 58.9372 20.8066 59.2097 19.8918H61.4091C61.0003 21.9939 59.2486 23.259 56.7379 23.259ZM56.6795 15.0454C55.2781 15.0454 54.4217 15.8045 54.1882 17.2448H59.0151C59.0151 15.9213 58.1003 15.0454 56.6795 15.0454ZM62.531 20.0864H64.7887C64.8082 20.9234 65.431 21.4489 66.521 21.4489C67.6304 21.4489 68.2337 21.0012 68.2337 20.3005C68.2337 19.814 67.9807 19.4636 67.1243 19.269L65.3921 18.8603C63.6598 18.471 62.8229 17.6535 62.8229 16.1159C62.8229 14.228 64.4189 13.0991 66.6377 13.0991C68.7982 13.0991 70.2579 14.3447 70.2774 16.2132H68.0196C68.0002 15.3958 67.4552 14.8703 66.5404 14.8703C65.6062 14.8703 65.0612 15.2985 65.0612 16.0186C65.0612 16.5636 65.4894 16.9139 66.3069 17.1085L68.0391 17.5173C69.6546 17.8871 70.472 18.6267 70.472 20.1059C70.472 22.0522 68.8176 23.259 66.4431 23.259C64.0491 23.259 62.531 21.9744 62.531 20.0864ZM73.4672 11.4642C72.6498 11.4642 72.0075 10.8219 72.0075 10.0239C72.0075 9.22588 72.6498 8.60305 73.4672 8.60305C74.2458 8.60305 74.8881 9.22588 74.8881 10.0239C74.8881 10.8219 74.2458 11.4642 73.4672 11.4642ZM72.28 23.006V13.391H74.6545V23.006H72.28ZM76.5628 17.9844C76.5628 15.1817 78.3924 13.0796 81.1367 13.0796C82.577 13.0796 83.7059 13.683 84.2703 14.7146L84.4066 13.391H86.6059V22.5194C86.6059 25.7308 84.6791 27.7356 81.5649 27.7356C78.8011 27.7356 76.9132 26.159 76.6212 23.5899H78.9958C79.1515 24.8355 80.1052 25.5751 81.5649 25.5751C83.1998 25.5751 84.2509 24.5436 84.2509 22.9476V21.3516C83.6475 22.2469 82.4602 22.8113 81.0783 22.8113C78.3535 22.8113 76.5628 20.7677 76.5628 17.9844ZM78.9568 17.926C78.9568 19.5415 79.9884 20.7482 81.5455 20.7482C83.1804 20.7482 84.1925 19.5999 84.1925 17.926C84.1925 16.2911 83.1998 15.1622 81.5455 15.1622C79.9689 15.1622 78.9568 16.3495 78.9568 17.926ZM91.4379 23.006H89.0633V13.391H91.2627L91.4573 14.6367C92.0607 13.6635 93.2285 13.0991 94.5325 13.0991C96.946 13.0991 98.1917 14.5978 98.1917 17.0891V23.006H95.8171V17.6535C95.8171 16.0381 95.0191 15.2595 93.7929 15.2595C92.3332 15.2595 91.4379 16.2716 91.4379 17.8287V23.006ZM100.33 13.391H101.692L101.887 12.1843C102.276 9.77086 103.619 8.5252 105.819 8.5252C106.208 8.5252 106.636 8.54466 106.987 8.62252L106.675 10.5883C106.403 10.5883 106.15 10.5689 105.877 10.5689C104.846 10.5689 104.32 11.0554 104.145 12.1843L103.95 13.391H106.208L105.897 15.2985H103.658L102.432 23.006H100.174L101.401 15.2985H100.019L100.33 13.391ZM106.098 18.8797C106.098 15.6683 108.609 13.138 111.742 13.138C114.486 13.138 116.335 14.8897 116.335 17.4978C116.335 20.7093 113.844 23.2395 110.691 23.2395C107.947 23.2395 106.098 21.4878 106.098 18.8797ZM108.433 18.7045C108.433 20.2227 109.348 21.2153 110.827 21.2153C112.579 21.2153 114 19.6388 114 17.673C114 16.1354 113.085 15.1427 111.625 15.1427C109.874 15.1427 108.433 16.7193 108.433 18.7045ZM119.701 23.006H117.424L119.701 8.5252H121.998L119.701 23.006ZM125.153 11.4447C124.452 11.4447 123.965 10.9192 123.965 10.2574C123.965 9.40105 124.724 8.62252 125.6 8.62252C126.281 8.62252 126.787 9.12856 126.787 9.80978C126.787 10.6467 126.009 11.4447 125.153 11.4447ZM122.194 23.006L123.712 13.391H125.989L124.471 23.006H122.194ZM127.044 18.8797C127.044 15.6683 129.554 13.138 132.688 13.138C135.432 13.138 137.281 14.8897 137.281 17.4978C137.281 20.7093 134.79 23.2395 131.637 23.2395C128.893 23.2395 127.044 21.4878 127.044 18.8797ZM129.379 18.7045C129.379 20.2227 130.294 21.2153 131.773 21.2153C133.525 21.2153 134.946 19.6388 134.946 17.673C134.946 16.1354 134.031 15.1427 132.571 15.1427C130.82 15.1427 129.379 16.7193 129.379 18.7045Z"
                  fill="#334155"
                />
              </svg>
            </a>
            <p className="mt-2 text-sm text-gray-500">
              Mock Interview Results by designfolio.me
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedFeedback;
