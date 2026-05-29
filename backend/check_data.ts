
import mongoose from 'mongoose';
import User from './src/models/User.js';
import Course from './src/models/Course.js';
import dotenv from 'dotenv';
import path from 'path';

// Fix for local path resolution
const __dirname = path.resolve();
dotenv.config({ path: path.join(__dirname, '.env') });

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // 1. Find the SLS User (assuming the recent one or by school)
        const slsStudents = await User.find({ school: 'SLS' });
        console.log('\n--- SLS Students ---');
        console.log(slsStudents.map(u => ({ name: u.name, email: u.email, school: u.school })));

        // 2. Check SOT Courses
        const sotCourses = await Course.find({ category: 'SOT' });
        console.log('\n--- SOT Courses ---');
        console.log(`Count: ${sotCourses.length}`);
        
        // 3. Check SLS Courses
        const slsCourses = await Course.find({ category: 'SLS' });
        console.log('\n--- SLS Courses ---');
        console.log(`Count: ${slsCourses.length}`);
        console.log(slsCourses.map(c => ({ name: c.name, category: c.category })));
        
        // 4. Check courses that might be mis-categorized
        const allCourses = await Course.find({});
        console.log('\n--- All Courses Review ---');
        allCourses.forEach(c => {
             console.log(`Course: ${c.name} | Category: ${c.category}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkData();
