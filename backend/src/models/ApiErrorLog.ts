import mongoose from 'mongoose';

const apiErrorLogSchema = new mongoose.Schema({
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  method: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  statusCode: {
    type: Number,
    default: 500
  },
  message: {
    type: String,
    required: true
  },
  stack: {
    type: String,
    default: ''
  },
  requestBody: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
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

apiErrorLogSchema.index({ createdAt: -1 });
apiErrorLogSchema.index({ path: 1, createdAt: -1 });

export default mongoose.model('ApiErrorLog', apiErrorLogSchema);
