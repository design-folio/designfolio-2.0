import { useState, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import { _checkUsername } from "@/network/post-request";

const MIN_LENGTH = 4;
const DEBOUNCE_MS = 1000;

export function useUsernameAvailability(value) {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [error, setError] = useState("");

  const checkDebounced = useDebouncedCallback(async (val) => {
    try {
      const response = await _checkUsername({ username: val });
      const available = response?.data?.available ?? false;
      setIsAvailable(available);
      setError(available ? "" : "This domain is already taken.");
    } catch {
      setError("Error checking availability.");
    } finally {
      setIsChecking(false);
    }
  }, DEBOUNCE_MS);

  useEffect(() => {
    if (!value) {
      setIsChecking(false);
      setIsAvailable(false);
      setError("");
      return;
    }
    if (value.length < MIN_LENGTH) {
      setIsChecking(false);
      setIsAvailable(false);
      setError(`Username must be at least ${MIN_LENGTH} characters.`);
      return;
    }
    setIsAvailable(false);
    setError("");
    setIsChecking(true);
    checkDebounced(value);
  }, [value, checkDebounced]);

  return { isChecking, isAvailable, error };
}
