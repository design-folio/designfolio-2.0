

import * as React from "react";

function DFLogoV2(props) {
    return (
        <svg width={37} height={37} viewBox="0 0 37 37" fill="none" {...props}>
            <rect width="37" height="37" rx="18.5" fill="#FF553E" />
            <path d="M20.0417 4.625H16.9583V14.7781L9.77902 7.59877L7.59877 9.77902L14.7781 16.9583H4.625V20.0417H14.7781L7.59877 27.221L9.77902 29.4012L16.9583 22.2219V32.375H20.0417V22.2219L27.221 29.4012L29.4012 27.221L22.2219 20.0417H32.375V16.9583H22.2219L29.4012 9.77902L27.221 7.59877L20.0417 14.7781V4.625Z" fill="white" />
        </svg>

    );
}

const MemoDFLogoV2 = React.memo(DFLogoV2);
export default MemoDFLogoV2;
