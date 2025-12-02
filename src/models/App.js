const mongoose = require('mongoose');
const { Schema } = mongoose;

const appSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('App', appSchema);
    