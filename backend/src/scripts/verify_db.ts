import mongoose from 'mongoose';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import User from '../models/User.js';
import { config } from '../config/env.js';

const verifyData = async () => {
    try {
        await mongoose.connect(config.mongodb.uri);
        console.log('Connected to MongoDB');

        const assignments = await Assignment.find({});
        console.log(`\nFound ${assignments.length} Assignments:`);
        assignments.forEach(a => {
            console.log(`- ID: ${a._id}, Title: "${a.title}", Due: ${a.dueDate}, File: ${a.fileUrl || 'None'}`);
        });

        const submissions = await Submission.find({}).populate('student', 'name email');
        console.log(`\nFound ${submissions.length} Submissions:`);
        submissions.forEach(s => {
            console.log(`- ID: ${s._id}, Assignment: ${s.assignment}, Student: ${s.student?.name} (${s.student?.email}), File: ${s.fileUrl}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verifyData();
