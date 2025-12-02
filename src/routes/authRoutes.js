const rateLimit = require("express-rate-limit");
const express = require('express');
const { googleAuth, authRequired } = require('../middleware/googleAuth');
const { registerApp, getApiKeys, revokeApiKey, login } = require('../controllers/authController');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: "Too many login attempts. Please wait." }
});

router.post('/google', loginLimiter, login);
router.post('/register', authRequired, registerApp);
router.get('/api-key', authRequired, getApiKeys);
router.post('/revoke', authRequired, revokeApiKey);
module.exports = router;
