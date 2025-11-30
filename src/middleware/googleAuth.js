const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID
  });
  return ticket.getPayload();
}

// Exchange Google idToken for our own JWT
async function googleAuth(req, res) {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: "idToken is required" });

    const payload = await verifyGoogleToken(idToken);
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;

    let user;
    const result = await pool.query(
      'SELECT * FROM users WHERE google_id=$1',
      [googleId]
    );
    if (result.rows.length === 0) {
      const insert = await pool.query(
        'INSERT INTO users (google_id, email, name) VALUES ($1,$2,$3) RETURNING *',
        [googleId, email, name]
      );
      user = insert.rows[0];
    } else {
      user = result.rows[0];
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid Google token" });
  }
}

function authRequired(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Missing or invalid Authorization header" });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId, email: decoded.email };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = { googleAuth, authRequired };
