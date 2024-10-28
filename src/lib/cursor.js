export const getCursor = (
  defaultCursor = "",
  pointer = "",
  notAllowed = ""
) => {
  document.documentElement.style.setProperty(
    "--cursor-default",
    `url(${defaultCursor}), default`
  );
  document.documentElement.style.setProperty(
    "--cursor-pointer",
    `url(${pointer}), pointer`
  );
  document.documentElement.style.setProperty(
    "--cursor-not-allowed",
    `url(${notAllowed}), not-allowed`
  );
};

const removeCursor = () => {
  document.documentElement.style.setProperty("--cursor-default", "default");
  document.documentElement.style.setProperty("--cursor-pointer", "pointer");
  document.documentElement.style.removeProperty(
    "--cursor-not-allowed",
    "not-allowed"
  );
};

export const setCursorvalue = (cursorType) => {
  switch (cursorType) {
    case 0:
      removeCursor();
      break;
    case 1:
      getCursor(
        "/assets/svgs/default1.svg",
        "/assets/svgs/pointer1.svg",
        "/assets/svgs/stop.svg"
      );
      break;
    case 2:
      getCursor(
        "/assets/svgs/default2.svg",
        "/assets/svgs/pointer1.svg",
        "/assets/svgs/stop.svg"
      );
      break;
    case 3:
      getCursor(
        "/assets/svgs/default3.svg",
        "/assets/svgs/pointer1.svg",
        "/assets/svgs/stop.svg"
      );
      break;
    case 4:
      getCursor(
        "/assets/svgs/default4.svg",
        "/assets/svgs/pointer1.svg",
        "/assets/svgs/stop.svg"
      );
      break;
    case 5:
      getCursor(
        "/assets/svgs/default5.svg",
        "/assets/svgs/pointer1.svg",
        "/assets/svgs/stop.svg"
      );
      break;
    case 6:
      getCursor(
        "/assets/svgs/default6.svg",
        "/assets/svgs/pointer1.svg",
        "/assets/svgs/stop.svg"
      );
      break;

    default:
      removeCursor();
      break;
  }
};
