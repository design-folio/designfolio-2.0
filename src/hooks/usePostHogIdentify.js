import { useCallback } from 'react';
import { usePostHog } from 'posthog-js/react';

export function usePostHogIdentify() {
  const posthog = usePostHog();

  const identifyUser = useCallback(
    (userId, properties = {}) => {
      if (!posthog) return;

      posthog.identify(userId, properties);
    },
    [posthog]
  );

  return identifyUser;
}
