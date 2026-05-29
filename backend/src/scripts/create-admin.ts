import User from '../models/User.js';
import { connectDB } from '../config/db.js';
import { APPROVAL_STATUS, ROLES, USER_STATUS } from '../config/roles.js';

const adminConfig = {
    name: process.env.ADMIN_NAME || 'System Admin',
    email: (process.env.ADMIN_EMAIL || 'admin@unilearn.com').toLowerCase(),
    password: process.env.ADMIN_PASSWORD || 'Admin@123456',
    phone: process.env.ADMIN_PHONE || '1234567890',
    personId: process.env.ADMIN_PERSON_ID || 'PDEU-ADMIN-001'
};

const createAdmin = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await connectDB();
        console.log('Connected to DB.');

        // Always sync the admin credentials so login is predictable.
        const existingAdmin = await User.findOne({ email: adminConfig.email }).select('+password');
        if (existingAdmin) {
            console.log(`Admin account ${adminConfig.email} already exists. Resetting credentials...`);
            existingAdmin.role = ROLES.SUPER_ADMIN;
            existingAdmin.status = USER_STATUS.ACTIVE;
            existingAdmin.approvalStatus = APPROVAL_STATUS.APPROVED;
            existingAdmin.approvalNote = 'Provisioned via create-admin script';
            existingAdmin.approvedAt = new Date();
            existingAdmin.password = adminConfig.password;
            existingAdmin.phone = existingAdmin.phone || adminConfig.phone;
            existingAdmin.personId = existingAdmin.personId || adminConfig.personId;
            await existingAdmin.save();
            console.log('Updated existing user to Super Admin and reset the password.');
            console.log('-----------------------------------');
            console.log(`Email: ${adminConfig.email}`);
            console.log(`Password: ${adminConfig.password}`);
            console.log(`Role: ${existingAdmin.role}`);
            console.log('-----------------------------------');
            return;
        }

        const admin = await User.create({
            name: adminConfig.name,
            email: adminConfig.email,
            password: adminConfig.password,
            phone: adminConfig.phone,
            role: ROLES.SUPER_ADMIN,
            status: USER_STATUS.ACTIVE,
            approvalStatus: APPROVAL_STATUS.APPROVED,
            approvalNote: 'Provisioned via create-admin script',
            approvedAt: new Date(),
            personId: adminConfig.personId
        });

        console.log('-----------------------------------');
        console.log('Admin user created successfully!');
        console.log(`Email: ${admin.email}`);
        console.log(`Password: ${adminConfig.password}`);
        console.log(`Role: ${admin.role}`);
        console.log('-----------------------------------');
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exitCode = 1;
    } finally {
        await User.db.close();
    }
};

createAdmin();
