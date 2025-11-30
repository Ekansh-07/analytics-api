const pool = require('../config/db');
const generateApiKey = require('../utils/apiKeyGenerator');

async function registerApp(req, res) {
  try {
    const { name, description, expiresInDays } = req.body;
    if (!name) return res.status(400).json({ message: "App name is required" });

    const userId = req.user.id;

    const appResult = await pool.query(
      'INSERT INTO apps (user_id, name, description) VALUES ($1,$2,$3) RETURNING *',
      [userId, name, description || null]
    );
    const app = appResult.rows[0];

    const key = generateApiKey();
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const apiKeyResult = await pool.query(
      'INSERT INTO api_keys (app_id, key, expires_at) VALUES ($1,$2,$3) RETURNING *',
      [app.id, key, expiresAt]
    );

    res.status(201).json({
      app,
      apiKey: apiKeyResult.rows[0].key,
      expiresAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getApiKeys(req, res) {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT api_keys.id, api_keys.key, api_keys.revoked, api_keys.expires_at, apps.id AS app_id, apps.name AS app_name
       FROM api_keys
       JOIN apps ON apps.id = api_keys.app_id
       WHERE apps.user_id=$1`,
      [userId]
    );
    res.json({ apiKeys: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function revokeApiKey(req, res) {
  try {
    const userId = req.user.id;
    const { apiKeyId } = req.body;
    if (!apiKeyId) return res.status(400).json({ message: "apiKeyId is required" });

    const check = await pool.query(
      `SELECT api_keys.id
       FROM api_keys
       JOIN apps ON apps.id = api_keys.app_id
       WHERE api_keys.id=$1 AND apps.user_id=$2`,
      [apiKeyId, userId]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ message: "API key not found or not owned by user" });
    }

    await pool.query('UPDATE api_keys SET revoked=true WHERE id=$1', [apiKeyId]);
    res.json({ message: "API key revoked" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { registerApp, getApiKeys, revokeApiKey };
