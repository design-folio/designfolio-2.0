/**
 * Tracks AI tools usage for guests (localStorage) to limit abuse and prompt login/signup.
 * Matches hero section pattern: "You've already used X once on this visit" → "Continue to sign up".
 */

const STORAGE_KEY = "DESIGNFOLIO_AI_TOOLS_USAGE";
const USES_PER_DAY_PER_TOOL = 2;
const DATE_KEY = "date";

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
