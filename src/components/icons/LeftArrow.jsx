import * as React from "react";

function LeftArrow(props) {
  return (
    <svg viewBox="0 0 6 9" fill="none" {...props}>
      <path
        d="M5 .5s-4 2.946-4 4c0 1.054 4 4 4 4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const MemoLeftArrow = React.memo(LeftArrow);
export default MemoLeftArrow;
