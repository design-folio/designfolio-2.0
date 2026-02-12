const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_COOLDOWN_MS = 60000; // 1 minute burst window
const DAILY_LIMIT_PER_ENDPOINT = 30;
const dailyLimitMap = new Map(); // key -> { count, date }
const rateLimitMap = new Map(); // key -> { attempts, timestamp }

function getDateKey() {
  return new Date().toISOString().slice(0, 10);
}

export function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  return req.socket?.remoteAddress ?? "unknown";
}

/**
 * Check rate limit for a request (IP-based: burst + daily).
 * @param {object} req - Next.js API request
 * @param {string} [endpointKey] - Optional key to scope rate limit per endpoint (e.g. "analyze-resume")
 * @returns {{ allowed: boolean, remainingSec?: number, dailyLimit?: boolean }}
 */
export function checkRateLimit(req, endpointKey = "default") {
  const ip = getClientIp(req);
  const dateKey = getDateKey();
  const burstKey = endpointKey ? `${ip}:${endpointKey}` : ip;
  const dailyKey = endpointKey ? `${ip}:${endpointKey}:${dateKey}` : `${ip}:${dateKey}`;

  const now = Date.now();

  // 1) Daily cap per IP per endpoint (get or create entry, then check)
  let dailyEntry = dailyLimitMap.get(dailyKey);
  if (!dailyEntry || dailyEntry.date !== dateKey) {
    dailyEntry = { count: 0, date: dateKey };
    dailyLimitMap.set(dailyKey, dailyEntry);
  }
  if (dailyEntry.count >= DAILY_LIMIT_PER_ENDPOINT) {
    return { allowed: false, dailyLimit: true };
  }

  // 2) Burst: max N requests per cooldown window
  const entry = rateLimitMap.get(burstKey);
  if (!entry) {
    rateLimitMap.set(burstKey, { attempts: 1, timestamp: now });
    dailyEntry.count += 1;
    return { allowed: true };
  }

  const { attempts, timestamp } = entry;
  const elapsed = now - timestamp;

  if (elapsed > RATE_LIMIT_COOLDOWN_MS) {
    rateLimitMap.set(burstKey, { attempts: 1, timestamp: now });
    dailyEntry.count += 1;
    return { allowed: true };
  }

  if (attempts >= RATE_LIMIT_MAX_ATTEMPTS) {
    const remainingSec = Math.ceil((RATE_LIMIT_COOLDOWN_MS - elapsed) / 1000);
    return { allowed: false, remainingSec };
  }

  entry.attempts += 1;
  dailyEntry.count += 1;
  return { allowed: true };
}
