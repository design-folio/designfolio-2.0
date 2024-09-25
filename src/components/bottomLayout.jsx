import useClient from "@/hooks/useClient";
import BottomNavigation from "./bottomNavigation";

export default function BottomLayout({ children }) {
  const { isClient } = useClient();
  return (
    <>
      {children}
      {isClient && <BottomNavigation />}
    </>
  );
}
