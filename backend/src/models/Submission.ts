import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileUrl: {
    type: String,
    required: true // Student must upload a file
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'graded'],
    default: 'draft'
  },
  grade: {
    type: Number
  },
  feedback: {
    type: String
  },
  gradedAt: {
    type: Date
  }
});

export default mongoose.model('Submission', submissionSchema);
