import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';
import path from 'path';

const __dirname = path.resolve();
dotenv.config({ path: path.join(__dirname, '.env') });

const checkAdmins = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const admins = await User.find({ role: { $in: ['ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin'] } });
        console.log('Admins found:', admins.map(a => ({ email: a.email, role: a.role, id: a._id })));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkAdmins();
