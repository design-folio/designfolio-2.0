import Navbar from "./navbar";
import LegacyHeader from "./legacy-header";
import ThemePanelConnected from "./theme-panel-connected";

export default function LoggedInHeader(props) {
  if ([0, 1, 3].includes(props.template)) {
    return (
      <>
        <Navbar />
        <ThemePanelConnected {...props} />
      </>
    );
  }
  return <LegacyHeader {...props} />;
}
