import { useCallback } from 'react';
import { usePostHog } from 'posthog-js/react';

export function usePostHogEvent() {
  const posthog = usePostHog();
  const captureEvent = useCallback(
    (eventName, properties = {}) => {
      if (!posthog) return;
      posthog.capture(eventName, {
        ...properties,
        timestamp: new Date().toISOString(),
      });
    },
    [posthog]
  );

  return captureEvent;
}
