import mongoose from 'mongoose';

const loginActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  status: {
    type: String,
    enum: ['success', 'failure'],
    required: true
  },
  reason: {
    type: String,
    default: ''
  },
  suspicious: {
    type: Boolean,
    default: false
  },
  detectedRules: [{
    type: String
  }],
  ipAddress: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

loginActivitySchema.index({ email: 1, createdAt: -1 });
loginActivitySchema.index({ suspicious: 1, createdAt: -1 });

export default mongoose.model('LoginActivity', loginActivitySchema);
