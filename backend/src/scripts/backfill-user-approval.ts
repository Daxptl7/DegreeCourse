import User from '../models/User.js';
import { connectDB } from '../config/db.js';
import { APPROVAL_STATUS, ROLES, USER_STATUS } from '../config/roles.js';

const backfillUserApproval = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await connectDB();

        const [teacherResult, nonTeacherResult, statusResult] = await Promise.all([
            User.updateMany(
                {
                    role: ROLES.TEACHER,
                    $or: [
                        { approvalStatus: { $exists: false } },
                        { approvalStatus: null }
                    ]
                },
                {
                    $set: {
                        approvalStatus: APPROVAL_STATUS.PENDING
                    }
                }
            ),
            User.updateMany(
                {
                    role: { $ne: ROLES.TEACHER },
                    $or: [
                        { approvalStatus: { $exists: false } },
                        { approvalStatus: null }
                    ]
                },
                {
                    $set: {
                        approvalStatus: APPROVAL_STATUS.APPROVED
                    }
                }
            ),
            User.updateMany(
                {
                    $or: [
                        { status: { $exists: false } },
                        { status: null }
                    ]
                },
                {
                    $set: {
                        status: USER_STATUS.ACTIVE
                    }
                }
            )
        ]);

        console.log('-----------------------------------');
        console.log(`Teachers marked pending: ${teacherResult.modifiedCount}`);
        console.log(`Non-teachers marked approved: ${nonTeacherResult.modifiedCount}`);
        console.log(`Users marked active: ${statusResult.modifiedCount}`);
        console.log('-----------------------------------');
    } catch (error) {
        console.error('Error backfilling user approvals:', error);
        process.exitCode = 1;
    } finally {
        await User.db.close();
    }
};

backfillUserApproval();
