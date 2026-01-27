import * as React from "react";

function QuoteIcon(props) {
    return (
        <svg width="24" height="20" viewBox="0 0 40 32" fill="none" {...props}>
            <path d="M0 13.5C0 7.5 2.5 2.5 7.5 -1.5L10.5 1.5C7 4.5 5 8 5 12C5 12.5 5.1 13 5.2 13.5C6 13 7 12.5 8.5 12.5C10.5 12.5 12 13 13.5 14.5C15 16 15.5 18 15.5 20C15.5 22 15 24 13.5 25.5C12 27 10.5 27.5 8.5 27.5C6 27.5 4 26.5 2.5 24.5C1 22.5 0 19.5 0 15.5V13.5ZM24 13.5C24 7.5 26.5 2.5 31.5 -1.5L34.5 1.5C31 4.5 29 8 29 12C29 12.5 29.1 13 29.2 13.5C30 13 31 12.5 32.5 12.5C34.5 12.5 36 13 37.5 14.5C39 16 39.5 18 39.5 20C39.5 22 39 24 37.5 25.5C36 27 34.5 27.5 32.5 27.5C30 27.5 28 26.5 26.5 24.5C25 22.5 24 19.5 24 15.5V13.5Z" fill="currentColor" />
        </svg>
    );
}

const MemoQuoteIcon = React.memo(QuoteIcon);
export default MemoQuoteIcon;