import mongoose from 'mongoose';
import Course from './src/models/Course.js';

const MONGODB_URI = 'mongodb+srv://daxbharatbhai30_db_user:daxx3011@dxdatabase.hcnspmi.mongodb.net/?appName=DxDataBase';

const fixCourseStatus = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    
    const result = await Course.updateOne(
      { slug: 'data-science-by-dxcode' },
      { $set: { status: 'approved' } }
    );
    
    console.log('Update result:', result);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

fixCourseStatus();
