import setRateLimit from "express-rate-limit";

// Rate limit middleware
const rateLimitMiddleware = setRateLimit({
  windowMs: 60 * 1000,
  max: 7,
  message: JSON.stringify("You have exceeded your 7 requests per minute limit. Try again in some time"),
  headers: true,
});

export default rateLimitMiddleware;