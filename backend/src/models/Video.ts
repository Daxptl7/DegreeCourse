
import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Tutorial', 'Insights', 'Tips', 'Editorial'],
    default: 'Tutorial'
  },
  description: {
    type: String,
    trim: true
  },
  duration: {
    type: String,
    required: true // e.g. "8 min read" or "10:30"
  },
  videoUrl: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    default: '' // URL to thumbnail image
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Video = mongoose.model('Video', videoSchema);

export default Video;
