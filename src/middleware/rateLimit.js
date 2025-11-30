const rateLimit = require('express-rate-limit');

const collectLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,            // 100 events / min / IP
  standardHeaders: true,
  legacyHeaders: false
});

const analyticsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30, 
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { collectLimiter, analyticsLimiter };
