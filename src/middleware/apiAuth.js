const pool = require('../config/db');

async function apiKeyAuth(req, res, next) {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({ message: "Missing x-api-key header" });
    }

    const result = await pool.query(
      `SELECT api_keys.*, apps.user_id
       FROM api_keys
       JOIN apps ON apps.id = api_keys.app_id
       WHERE api_keys.key=$1 AND api_keys.revoked=false
         AND (api_keys.expires_at IS NULL OR api_keys.expires_at > NOW())`,
      [apiKey]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid or expired API key" });
    }

    const row = result.rows[0];
    req.appContext = {
      appId: row.app_id,
      ownerUserId: row.user_id
    };
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = apiKeyAuth;
