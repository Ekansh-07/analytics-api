const pool = require('../config/db');
const { client: redis } = require('../config/redis');

// 1. Event Collection
async function collectEvent(req, res) {
  try {
    const { appId } = req.appContext;
    const {
      event,
      url,
      referrer,
      device,
      ipAddress,
      timestamp,
      metadata,
      userId,
      userAgent
    } = req.body;

    if (!event || !timestamp) {
      return res.status(400).json({ message: "event and timestamp are required" });
    }

    const ts = new Date(timestamp);
    if (isNaN(ts.getTime())) {
      return res.status(400).json({ message: "Invalid timestamp" });
    }

    const ip = ipAddress || req.ip;

    await pool.query(
      `INSERT INTO events
       (app_id, user_id, event_name, url, referrer, device, ip_address, ts, metadata, user_agent)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        appId,
        userId || null,
        event,
        url || null,
        referrer || null,
        device || null,
        ip || null,
        ts,
        metadata || {},
        userAgent || req.headers['user-agent'] || null
      ]
    );

    res.status(201).json({ message: "Event collected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

// 2. Event Summary
async function eventSummary(req, res) {
  try {
    const { event, startDate, endDate, app_id } = req.query;
    if (!event) return res.status(400).json({ message: "event is required" });

    const userId = req.user?.id; // platform user (for filtering when app_id is not provided)

    const cacheKey = `eventSummary:${event}:${startDate || 'null'}:${endDate || 'null'}:${app_id || 'all'}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const params = [event];
    let where = 'event_name = $1';

    if (startDate) {
      params.push(startDate);
      where += ` AND ts >= $${params.length}`;
    }
    if (endDate) {
      params.push(endDate);
      where += ` AND ts <= $${params.length}::date + INTERVAL '1 day'`;
    }

    if (app_id) {
      params.push(app_id);
      where += ` AND app_id = $${params.length}`;
    } else if (userId) {
      // all apps created by this user
      params.push(userId);
      where += ` AND app_id IN (SELECT id FROM apps WHERE user_id = $${params.length})`;
    }

    // count + unique users
    const aggQuery = `
      SELECT 
        COUNT(*) AS count,
        COUNT(DISTINCT user_id) AS unique_users
      FROM events
      WHERE ${where}
    `;
    const aggResult = await pool.query(aggQuery, params);
    const count = parseInt(aggResult.rows[0].count, 10);
    const uniqueUsers = parseInt(aggResult.rows[0].unique_users, 10);

    // device data
    const deviceQuery = `
      SELECT device, COUNT(*) AS cnt
      FROM events
      WHERE ${where}
      GROUP BY device
    `;
    const deviceResult = await pool.query(deviceQuery, params);

    const deviceData = {};
    for (const row of deviceResult.rows) {
      deviceData[row.device || 'unknown'] = parseInt(row.cnt, 10);
    }

    const response = {
      event,
      count,
      uniqueUsers,
      deviceData
    };

    await redis.set(cacheKey, JSON.stringify(response), { EX: 60 }); // cache 60s
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

// 3. User Stats
async function userStats(req, res) {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const userQuery = `
      SELECT
        COUNT(*) AS total_events,
        MAX(ts) AS last_event_at,
        MAX(metadata->>'browser') AS browser,
        MAX(metadata->>'os') AS os,
        MAX(ip_address::text) AS ip
      FROM events
      WHERE user_id = $1
    `;
    const result = await pool.query(userQuery, [userId]);
    const row = result.rows[0];

    const totalEvents = parseInt(row.total_events, 10);

    const response = {
      userId,
      totalEvents,
      deviceDetails: {
        browser: row.browser || null,
        os: row.os || null
      },
      ipAddress: row.ip || null
    };

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { collectEvent, eventSummary, userStats };
