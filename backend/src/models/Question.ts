import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: { // Changed from 'answer' to 'content' for clarity
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const questionSchema = new mongoose.Schema({
  student: { // Renamed from user to student for clarity
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: { // Renamed from 'question' to 'description'
    type: String,
    required: true
  },
  imageUrl: {
    type: String // Optional image URL
  },
  status: {
    type: String,
    enum: ['open', 'completed'],
    default: 'open'
  },
  answers: [answerSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Question', questionSchema);
