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

const checkCourses = async () => {
    await connectDB();
    const courses = await Course.find({});
    console.log('--- Current Courses ---');
    courses.forEach(c => {
        console.log(`Name: ${c.name} | Category: ${c.category} | ID: ${c._id}`);
    });
    console.log('-----------------------');
    process.exit();
};

checkCourses();
