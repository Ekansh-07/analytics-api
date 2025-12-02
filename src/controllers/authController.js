const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/User');
const App = require('../models/App');
const ApiKey = require('../models/ApiKey');
const generateApiKey = require('../utils/apiKeyGenerator');

async function login(req, res) {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ message: 'email is required' });

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, name });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}


async function registerApp(req, res) {
  try {
    const { name, description, expiresInDays } = req.body;
    if (!name) return res.status(400).json({ message: 'App name is required' });

    const userId = req.user.id;

    const app = await App.create({
      user: userId,
      name,
      description: description || ''
    });

    const key = generateApiKey();
    let expiresAt = null;
    if (expiresInDays) {
      expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
    }

    const apiKeyDoc = await ApiKey.create({
      app: app._id,
      key,
      expiresAt
    });

    res.status(201).json({
      app: {
        id: app._id.toString(),
        name: app.name,
        description: app.description
      },
      apiKey: apiKeyDoc.key,
      expiresAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getApiKeys(req, res) {
  try {
    const userId = req.user.id;

    const keys = await ApiKey.find()
      .populate({
        path: 'app',
        match: { user: userId },
        select: 'name'
      })
      .lean();

    const filtered = keys.filter(k => k.app); // only apps owned by user

    res.json({
      apiKeys: filtered.map(k => ({
        id: k._id.toString(),
        key: k.key,
        revoked: k.revoked,
        expiresAt: k.expiresAt,
        app_id: k.app._id.toString(),
        app_name: k.app.name
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function revokeApiKey(req, res) {
  try {
    const userId = req.user.id;
    const { apiKeyId } = req.body;
    if (!apiKeyId) return res.status(400).json({ message: 'apiKeyId is required' });

    const apiKeyDoc = await ApiKey.findById(apiKeyId).populate('app');
    if (!apiKeyDoc || apiKeyDoc.app.user.toString() !== userId) {
      return res.status(404).json({ message: 'API key not found or not owned by user' });
    }

    apiKeyDoc.revoked = true;
    await apiKeyDoc.save();

    res.json({ message: 'API key revoked' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { login, registerApp, getApiKeys, revokeApiKey };
