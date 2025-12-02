const express = require('express');
const { googleAuth, authRequired } = require('../middleware/googleAuth');
const { registerApp, getApiKeys, revokeApiKey, login } = require('../controllers/authController');

const router = express.Router();

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Onboard user via Google Auth and return JWT
 */
router.post('/google', login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registers a new website/app and generates an API key
 */
router.post('/register', authRequired, registerApp);

/**
 * @swagger
 * /api/auth/api-key:
 *   get:
 *     summary: Retrieves API keys for current user
 */
router.get('/api-key', authRequired, getApiKeys);

/**
 * @swagger
 * /api/auth/revoke:
 *   post:
 *     summary: Revokes an API key
 */
router.post('/revoke', authRequired, revokeApiKey);

module.exports = router;
