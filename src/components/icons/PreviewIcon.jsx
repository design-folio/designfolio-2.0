import * as React from "react";

function PreviewIcon(props) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M17 7L6 18"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <path
        d="M11 6.132s5.634-.475 6.488.38c.855.854.38 6.488.38 6.488"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const MemoPreviewIcon = React.memo(PreviewIcon);
export default MemoPreviewIcon;
