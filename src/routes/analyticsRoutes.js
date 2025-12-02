const express = require('express');
const apiKeyAuth = require('../middleware/apiAuth');
const { authRequired } = require('../middleware/googleAuth');
const { collectLimiter, analyticsLimiter } = require('../middleware/rateLimit');
const { collectEvent, eventSummary, userStats } = require('../controllers/analyticsController');

const router = express.Router();

/**
 * @swagger
 * /api/analytics/collect:
 *   post:
 *     summary: Collect analytics event
 */
router.post('/collect', apiKeyAuth, collectLimiter, collectEvent);

/**
 * @swagger
 * /api/analytics/event-summary:
 *   get:
 *     summary: Get event summary
 */
router.get('/event-summary', authRequired, analyticsLimiter, eventSummary);

/**
 * @swagger
 * /api/analytics/user-stats:
 *   get:
 *     summary: Get stats for a specific user
 */
router.get('/user-stats', authRequired, analyticsLimiter, userStats);

module.exports = router;