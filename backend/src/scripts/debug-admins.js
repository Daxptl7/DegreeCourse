import mongoose from 'mongoose';
import User from '../models/User.js';
import { connectDB } from '../config/db.js';
import { ROLES } from '../config/roles.js';

const checkAdmins = async () => {
    try {
        await connectDB();
        const adminRoles = ['super_admin', 'admin', 'moderator'];
        const admins = await User.find({ role: { $in: adminRoles } }).select('email name role');
        console.log(`Found ${admins.length} admins:`);
        admins.forEach(a => console.log(`- ${a.name} (${a.email}): ${a.role}`));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

checkAdmins();
