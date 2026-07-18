import { useCallback } from "react";
import { useGlobalContext } from "@/context/globalContext";

/**
 * Gate a Pro-only action behind the upgrade paywall.
 *
 * Returns a `requirePro(source)` callback that mirrors the existing inline
 * paywall pattern: if the user is not Pro it opens the global Upgrade modal
 * (keyed by `source`) and returns `true` so the caller can short-circuit.
 * When the user is Pro it returns `false` and the action proceeds.
 *
 *   const requirePro = useProGate();
 *   if (requirePro("password-protect")) return;
 *   // ...pro-only action
 */
export function useProGate() {
  const { userDetails, setShowUpgradeModal, setUpgradeModalSource } = useGlobalContext();

  return useCallback(
    (source) => {
      if (userDetails?.pro) return false;
      setUpgradeModalSource(source);
      setShowUpgradeModal(true);
      return true;
    },
    [userDetails?.pro, setShowUpgradeModal, setUpgradeModalSource]
  );
}
