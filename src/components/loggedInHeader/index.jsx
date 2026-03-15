import Navbar from "./navbar";
import LegacyHeader from "./legacy-header";
import ThemePanelConnected from "./theme-panel-connected";

export default function LoggedInHeader(props) {
  if (props.template === 0) {
    return (
      <>
        <Navbar />
        <ThemePanelConnected {...props} />
      </>
    );
  }
  return <LegacyHeader {...props} />;
}
