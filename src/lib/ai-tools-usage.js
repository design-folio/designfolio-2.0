const RESULT_KEY_PREFIX = "DESIGNFOLIO_AI_RESULT_";

export function setAiToolResult(toolType, result) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      RESULT_KEY_PREFIX + toolType,
      typeof result === "string" ? result : JSON.stringify(result)
    );
  } catch (_) {}
}

export function getAiToolResult(toolType) {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(RESULT_KEY_PREFIX + toolType);
    if (raw == null) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  } catch (_) {
    return null;
  }
}

export function clearAiToolResult(toolType) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(RESULT_KEY_PREFIX + toolType);
  } catch (_) {}
}
