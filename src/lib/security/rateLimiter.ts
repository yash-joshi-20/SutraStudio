/**
 * SUTRA STUDIO — Security & Rate Limiting Utility
 * Sliding window rate limiter for protecting sensitive API endpoints against abuse and brute-force.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up stale entries every 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (record.resetAt <= now) {
        rateLimitMap.delete(key);
      }
    }
  }, 10 * 60 * 1000);
}

export interface RateLimitConfig {
  maxRequests: number; // Maximum allowed requests
  windowSeconds: number; // Time window in seconds
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 60, windowSeconds: 60 }
): { success: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const existing = rateLimitMap.get(identifier);

  if (!existing || existing.resetAt <= now) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetInSeconds: config.windowSeconds,
    };
  }

  if (existing.count >= config.maxRequests) {
    const resetInSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return {
      success: false,
      remaining: 0,
      resetInSeconds,
    };
  }

  existing.count += 1;
  const resetInSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  return {
    success: true,
    remaining: config.maxRequests - existing.count,
    resetInSeconds,
  };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}
