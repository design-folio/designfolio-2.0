import * as React from "react";
function AppleIcon(props) {
    return (
        <svg width="18" height="18" viewBox="0 0 32 32" fill="none" style={{ display: 'block' }} {...props}>
            <g clipPath="url(#clip0_macos_apple)">
                <path d="M30.472 3.045H28.952V1.525H27.432V-0.00500488H6.09197V12.195H1.52197V13.715H9.14197V12.195H7.62197V1.525H24.382V7.615H30.472V22.855H28.952V25.905H30.472V30.475H32.002V4.575H30.472V3.045Z" fill="white" />
                <path d="M30.4719 30.475H7.62195V31.995H30.4719V30.475Z" fill="white" />
                <path d="M28.952 19.805H27.432V22.855H28.952V19.805Z" fill="white" />
                <path d="M27.432 16.765H25.902V19.805H27.432V16.765Z" fill="white" />
                <path d="M25.902 15.235H10.672V16.765H25.902V15.235Z" fill="white" />
                <path d="M21.332 7.61499H19.812V9.14499H21.332V7.61499Z" fill="white" />
                <path d="M19.8119 10.665H15.2419V12.195H19.8119V10.665Z" fill="white" />
                <path d="M15.2419 7.61499H13.7119V9.14499H15.2419V7.61499Z" fill="white" />
                <path d="M10.672 13.715H9.14197V15.235H10.672V13.715Z" fill="white" />
                <path d="M7.62192 27.425H6.09192V30.475H7.62192V27.425Z" fill="white" />
                <path d="M6.0919 24.385H4.5719V27.425H6.0919V24.385Z" fill="white" />
                <path d="M4.572 21.335H3.052V24.385H4.572V21.335Z" fill="white" />
                <path d="M3.05197 18.285H1.52197V21.335H3.05197V18.285Z" fill="white" />
                <path d="M1.52195 13.715H0.00195312V18.285H1.52195V13.715Z" fill="white" />
            </g>
            <defs>
                <clipPath id="clip0_macos_apple">
                    <rect width="32" height="32" fill="white" />
                </clipPath>
            </defs>
        </svg>)
}

const MemoAppleIcon = React.memo(AppleIcon);
export default MemoAppleIcon;