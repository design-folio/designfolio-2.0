import Navbar from "./navbar";
import ThemePanelConnected from "./theme-panel-connected";

export default function LoggedInHeader(props) {
  return (
    <>
      <Navbar />
      <ThemePanelConnected {...props} />
    </>
  );
}
