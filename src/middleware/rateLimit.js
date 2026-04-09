const buckets = new Map();

function getClientKey(request, scope) {
  const forwardedFor = String(request.headers["x-forwarded-for"] || "")
    .split(",")[0]
    .trim();
  const ip = forwardedFor || request.ip || "unknown";

  return `${scope}:${ip}`;
}

function prune(now) {
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

function rateLimit({ max = 20, windowMs = 60_000, scope = "global" } = {}) {
  return async function rateLimitPreHandler(request, reply) {
    const now = Date.now();
    prune(now);

    const key = getClientKey(request, scope);
    const bucket = buckets.get(key) || {
      count: 0,
      resetAt: now + windowMs,
    };

    if (bucket.resetAt <= now) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    buckets.set(key, bucket);

    const remaining = Math.max(0, max - bucket.count);
    reply.header("X-RateLimit-Limit", String(max));
    reply.header("X-RateLimit-Remaining", String(remaining));
    reply.header("X-RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > max) {
      return reply.status(429).send({
        message: "Too many requests. Please try again later.",
      });
    }
  };
}

module.exports = {
  rateLimit,
};
