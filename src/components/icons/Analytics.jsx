import * as React from "react";

function Analytics(props) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M6.917 14.854l2.993-3.889 3.414 2.68 2.93-3.78"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        clipRule="evenodd"
        d="M19.667 2.35a1.921 1.921 0 11.001 3.842 1.921 1.921 0 010-3.842z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.756 9.269c.133.895.194 1.903.194 3.034 0 6.938-2.313 9.25-9.25 9.25-6.938 0-9.25-2.312-9.25-9.25 0-6.937 2.312-9.25 9.25-9.25 1.11 0 2.1.059 2.982.187"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const MemoAnalytics = React.memo(Analytics);
export default MemoAnalytics;
