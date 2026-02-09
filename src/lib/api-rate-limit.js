const RATE_LIMIT_MAX_ATTEMPTS = 3;
const RATE_LIMIT_COOLDOWN_MS = 40000; // 40 seconds
const rateLimitMap = new Map(); // key -> { attempts, timestamp }

export function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  return req.socket?.remoteAddress ?? "unknown";
}

/**
 * Check rate limit for a request.
 * @param {object} req - Next.js API request
 * @param {string} [endpointKey] - Optional key to scope rate limit per endpoint (e.g. "analyze-resume")
 * @returns {{ allowed: boolean, remainingSec?: number }}
 */
export function checkRateLimit(req, endpointKey = "default") {
  const ip = getClientIp(req);
  const key = endpointKey ? `${ip}:${endpointKey}` : ip;

  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry) {
    rateLimitMap.set(key, { attempts: 1, timestamp: now });
    return { allowed: true };
  }

  const { attempts, timestamp } = entry;
  const elapsed = now - timestamp;

  if (elapsed > RATE_LIMIT_COOLDOWN_MS) {
    rateLimitMap.set(key, { attempts: 1, timestamp: now });
    return { allowed: true };
  }

  if (attempts >= RATE_LIMIT_MAX_ATTEMPTS) {
    const remainingSec = Math.ceil((RATE_LIMIT_COOLDOWN_MS - elapsed) / 1000);
    return { allowed: false, remainingSec };
  }

  entry.attempts += 1;
  return { allowed: true };
}
