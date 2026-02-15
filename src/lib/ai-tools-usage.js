/**
 * Tracks AI tools usage for guests (localStorage) to limit abuse and prompt login/signup.
 * Matches hero section pattern: "You've already used X once on this visit" → "Continue to sign up".
 */

const STORAGE_KEY = "DESIGNFOLIO_AI_TOOLS_USAGE";
export const USES_PER_DAY_PER_TOOL = 1;
const DATE_KEY = "date";

const RESULT_KEY_PREFIX = "DESIGNFOLIO_AI_RESULT_";

function getDateKey() {
  return new Date().toISOString().slice(0, 10);
}

function getStored() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    const today = getDateKey();
    if (data[DATE_KEY] !== today) return {};
    return data;
  } catch {
    return {};
  }
}

function setStored(data) {
  if (typeof window === "undefined") return;
  try {
    const payload = { ...data, [DATE_KEY]: getDateKey() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (_) {}
}

/**
 * Returns usage for a given tool type (e.g. "optimize-resume", "mock-interview").
 * @param {string} toolType - navigation type from ai-tools (e.g. navigation.optimizeResume)
 * @returns {{ usedToday: number, limit: number, allowed: boolean }}
 */
export function getAiToolUsage(toolType) {
  const data = getStored();
  const usedToday = typeof data[toolType] === "number" ? data[toolType] : 0;
  const limit = USES_PER_DAY_PER_TOOL;
  return {
    usedToday,
    limit,
    allowed: usedToday < limit,
  };
}

/**
 * Call after a successful AI tool use (guest). Increments the count for that tool.
 * @param {string} toolType - same as getAiToolUsage
 */
export function incrementAiToolUsage(toolType) {
  const data = getStored();
  const today = getDateKey();
  if (data[DATE_KEY] !== today) {
    setStored({ [toolType]: 1 });
    return;
  }
  const next = (data[toolType] || 0) + 1;
  setStored({ ...data, [toolType]: next });
}

/**
 * Persist AI tool result to localStorage (so we can restore state on return/refresh).
 * @param {string} toolType - e.g. "optimize-resume", "email-generator", "salary-negotiator"
 * @param {object|string} result - Result to store (will be JSON.stringify'd)
 */
export function setAiToolResult(toolType, result) {
  if (typeof window === "undefined") return;
  try {
    const key = RESULT_KEY_PREFIX + toolType;
    const value = typeof result === "string" ? result : JSON.stringify(result);
    localStorage.setItem(key, value);
  } catch (_) {}
}

/**
 * Get stored AI tool result, if any.
 * @param {string} toolType - same as setAiToolResult
 * @returns {object|string|null} Parsed result or null
 */
export function getAiToolResult(toolType) {
  if (typeof window === "undefined") return null;
  try {
    const key = RESULT_KEY_PREFIX + toolType;
    const raw = localStorage.getItem(key);
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
