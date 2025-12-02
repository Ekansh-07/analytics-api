const App = require('../models/App');
const Event = require('../models/Event');

// POST /api/analytics/collect
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
      return res.status(400).json({ message: 'event and timestamp are required' });
    }

    const ts = new Date(timestamp);
    if (isNaN(ts.getTime())) {
      return res.status(400).json({ message: 'Invalid timestamp' });
    }

    const ip = ipAddress || req.ip;

    await Event.create({
      app: appId,
      userId: userId || null,
      event,
      url: url || null,
      referrer: referrer || null,
      device: device || null,
      ipAddress: ip || null,
      timestamp: ts,
      metadata: metadata || {},
      userAgent: userAgent || req.headers['user-agent'] || null
    });

    res.status(201).json({ message: 'Event collected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// GET /api/analytics/event-summary
async function eventSummary(req, res) {
  try {
    const { event, startDate, endDate, app_id } = req.query;
    if (!event) return res.status(400).json({ message: 'event is required' });

    const userId = req.user.id;

    let appFilterIds = [];
    if (app_id) {
      appFilterIds = [app_id];
    } else {
      const apps = await App.find({ user: userId }, '_id');
      appFilterIds = apps.map(a => a._id);
    }

    const match = {
      event,
      app: { $in: appFilterIds }
    };

    if (startDate) {
      match.timestamp = { ...(match.timestamp || {}), $gte: new Date(startDate) };
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1); // include entire end day
      match.timestamp = { ...(match.timestamp || {}), $lt: end };
    }

    const [agg] = await Event.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      }
    ]);

    const deviceAgg = await Event.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$device',
          cnt: { $sum: 1 }
        }
      }
    ]);

    const deviceData = {};
    deviceAgg.forEach(d => {
      const key = d._id || 'unknown';
      deviceData[key] = d.cnt;
    });

    res.json({
      event,
      count: agg ? agg.count : 0,
      uniqueUsers: agg ? agg.uniqueUsers.filter(Boolean).length : 0,
      deviceData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// GET /api/analytics/user-stats
async function userStats(req, res) {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    const result = await Event.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$userId',
          totalEvents: { $sum: 1 },
          lastEventAt: { $max: '$timestamp' },
          browser: { $last: '$metadata.browser' },
          os: { $last: '$metadata.os' },
          ip: { $last: '$ipAddress' }
        }
      }
    ]);

    const row = result[0];

    res.json({
      userId,
      totalEvents: row ? row.totalEvents : 0,
      deviceDetails: {
        browser: row ? row.browser || null : null,
        os: row ? row.os || null : null
      },
      ipAddress: row ? row.ip || null : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { collectEvent, eventSummary, userStats };
