const mongoose = require('mongoose');
const { Schema } = mongoose;

const eventSchema = new Schema(
  {
    app: { type: Schema.Types.ObjectId, ref: 'App', required: true },
    userId: { type: String }, // app-side user id
    event: { type: String, required: true }, // event_name
    url: String,
    referrer: String,
    device: String,
    ipAddress: String,
    timestamp: { type: Date, required: true },
    metadata: { type: Schema.Types.Mixed },
    userAgent: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
