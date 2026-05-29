import mongoose from 'mongoose';
import Course from './src/models/Course.js';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

const updateCourses = async () => {
    await connectDB();
    
    // 1. Data Science -> SLS
    const ds = await Course.findOneAndUpdate(
        { name: { $regex: /Data Science/i } },
        { category: 'SLS' },
        { new: true }
    );
    if(ds) console.log(`Updated '${ds.name}' to SLS`);
    else console.log('Data Science course not found.');

    // 2. Others -> SOT
    // Update all that are NOT SLS to SOT
    const result = await Course.updateMany(
        { category: { $ne: 'SLS' } },
        { category: 'SOT' }
    );
    console.log(`Updated ${result.modifiedCount} other courses to SOT.`);
    
    process.exit();
};

updateCourses();
