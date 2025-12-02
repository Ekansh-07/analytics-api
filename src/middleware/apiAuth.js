const ApiKey = require('../models/ApiKey');

async function apiKeyAuth(req, res, next) {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({ message: 'Missing x-api-key header' });
    }

    const keyDoc = await ApiKey.findOne({
      key: apiKey,
      revoked: false,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }]
    }).populate('app');

    if (!keyDoc) {
      return res.status(401).json({ message: 'Invalid or expired API key' });
    }

    req.appContext = {
      appId: keyDoc.app._id.toString(),
      ownerUserId: keyDoc.app.user.toString()
    };

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = apiKeyAuth;
