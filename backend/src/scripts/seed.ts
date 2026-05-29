import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Course from '../models/Course.js';
import { connectDB } from '../config/db.js';

dotenv.config();

const seedData = async () => {
    try {
        await connectDB();
        
        console.log('Seeding data...');

        // 1. Create Teacher
        const teacherEmail = 'teacher@example.com';
        let teacher = await User.findOne({ email: teacherEmail });
        
        if (!teacher) {
            teacher = await User.create({
                name: 'Jane Doe',
                email: teacherEmail,
                phone: '1234567890',
                password: 'password123',
                role: 'teacher'
            });
            console.log('Teacher created:', teacher.email);
        } else {
            console.log('Teacher already exists:', teacher.email);
        }

        // 2. Create Course
        const courseSlug = 'intro-to-web-dev';
        let course = await Course.findOne({ slug: courseSlug });

        if (!course) {
            course = await Course.create({
                name: 'Introduction to Web Development',
                slug: courseSlug,
                category: 'Development',
                subtitle: 'Learn the basics of HTML, CSS, and JavaScript',
                description: 'A comprehensive guide to becoming a web developer.',
                instructor: teacher._id,
                provider: 'Unilearn',
                price: 49.99,
                thumbnail: 'https://via.placeholder.com/600x400',
                status: 'approved',
                whatYouLearn: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design'],
                stats: {
                    rating: 4.8,
                    reviews: 120,
                    difficulty: 'Beginner'
                }
            });
            console.log('Course created:', course.name);
        } else {
            console.log('Course already exists:', course.name);
        }

        console.log('Seeding completed successfully.');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
