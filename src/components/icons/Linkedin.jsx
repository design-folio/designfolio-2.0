import * as React from "react";

function Linkedin(props) {
  return (
    <svg width={23} height={23} viewBox="0 0 23 23" fill="none" {...props}>
      <g clipPath="url(#prefix__clip0_1942_2801)">
        <path
          d="M20.872.918H2.123C1.226.918.5 1.628.5 2.504v18.824c0 .877.726 1.59 1.624 1.59h18.747c.899 0 1.629-.713 1.629-1.585V2.503c0-.876-.73-1.585-1.628-1.585zM7.027 19.665H3.76V9.165h3.266v10.502zM5.394 7.734a1.892 1.892 0 11-.007-3.783 1.892 1.892 0 01.007 3.783zm13.853 11.933h-3.261V14.56c0-1.216-.022-2.785-1.697-2.785-1.698 0-1.955 1.328-1.955 2.699v5.19H9.077V9.165h3.128v1.435h.043c.434-.825 1.5-1.697 3.085-1.697 3.304 0 3.914 2.174 3.914 5.001v5.763z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="prefix__clip0_1942_2801">
          <path fill="#fff" transform="translate(.5 .918)" d="M0 0h22v22H0z" />
        </clipPath>
      </defs>
    </svg>
  );
}

const MemoLinkedin = React.memo(Linkedin);
export default MemoLinkedin;
