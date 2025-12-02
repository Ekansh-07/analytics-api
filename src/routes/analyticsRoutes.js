const rateLimit = require("express-rate-limit");
const express = require('express');
const apiKeyAuth = require('../middleware/apiAuth');
const { authRequired } = require('../middleware/googleAuth');
const { collectLimiter, analyticsLimiter } = require('../middleware/rateLimit');
const { collectEvent, eventSummary, userStats } = require('../controllers/analyticsController');

const router = express.Router();
const eventLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: { message: "Please wait before sending more events." }
});

// POST /collect
router.post('/collect', eventLimiter, apiKeyAuth, collectEvent);

// GET /event-summary
router.get('/event-summary', eventSummary);

// GET /user-stats
router.get('/user-stats', userStats);

module.exports = router;