const mongoose = require('mongoose');
const { Schema } = mongoose;

const apiKeySchema = new Schema(
  {
    app: { type: Schema.Types.ObjectId, ref: 'App', required: true },
    key: { type: String, required: true, unique: true },
    revoked: { type: Boolean, default: false },
    expiresAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ApiKey', apiKeySchema);
