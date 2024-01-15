import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

class RateLimiters {
  static limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
  });

  static speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 100, // allow 100 requests per 15 minutes, then...
    delayMs: () => 500, // begin adding 500ms of delay per request above 100
    // (so request 101 takes 500ms, request 102 takes 1000ms, etc)
  });
}

export default RateLimiters;