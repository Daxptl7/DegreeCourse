import mongoose from 'mongoose';
import Course from './src/models/Course.js';

const MONGODB_URI = 'mongodb+srv://daxbharatbhai30_db_user:daxx3011@dxdatabase.hcnspmi.mongodb.net/?appName=DxDataBase';

const debugCourses = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    const courses = await Course.find({});
    console.log(`Found ${courses.length} courses:`);
    courses.forEach(c => {
      console.log(`- [${c.status}] ${c.name} (Slug: ${c.slug}, Thumbnail: ${c.thumbnail ? 'Yes' : 'No'})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

debugCourses();
