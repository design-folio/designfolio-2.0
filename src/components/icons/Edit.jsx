import * as React from "react";

function Edit(props) {
  return (
    <svg width={17} height={17} fill="none" {...props}>
      <path
        stroke="currentColor"
        strokeLinejoin="round"
        d="M9.88 3.092c.497-.538.746-.807 1.01-.964a2.07 2.07 0 012.068-.031c.269.149.525.41 1.037.933.512.523.768.785.914 1.06.351.66.34 1.462-.03 2.112-.154.27-.418.524-.945 1.031l-6.269 6.038c-.998.962-1.498 1.443-2.122 1.687-.624.243-1.31.226-2.681.19l-.187-.005c-.418-.011-.627-.017-.748-.155-.121-.137-.105-.35-.072-.775l.018-.231c.094-1.198.14-1.796.374-2.335.234-.538.637-.975 1.444-1.849l6.19-6.706zm-.715.077l4.667 4.666"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.831 15.169h5.334"
      />
    </svg>
  );
}

const MemoEdit = React.memo(Edit);
export default MemoEdit;
