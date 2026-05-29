import mongoose from 'mongoose';
import Announcement from '../models/Announcement.js';
import Course from '../models/Course.js';

// Create a new announcement (Teacher only)
export const createAnnouncement = async (req, res) => {
    try {
        const { courseId, title, content } = req.body;
        const teacherId = req.user._id;

        // Verify the teacher owns the course
        const course = await Course.findOne({ _id: courseId, instructor: teacherId });
        if (!course) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to make announcements for this course."
            });
        }

        const newAnnouncement = new Announcement({
            course: courseId,
            instructor: teacherId,
            title,
            content,
            readBy: [] // Initially read by no one
        });

        await newAnnouncement.save();

        res.status(201).json({
            success: true,
            data: newAnnouncement,
            message: "Announcement created successfully!"
        });

    } catch (error) {
        console.error("Create Announcement Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Get all announcements for a specific course
export const getAnnouncements = async (req, res) => {
    try {
        const { courseId } = req.params;

        const announcements = await Announcement.find({ course: courseId })
            .sort({ createdAt: -1 })
            .populate('instructor', 'name');

        res.status(200).json({
            success: true,
            data: announcements
        });

    } catch (error) {
        console.error("Get Announcements Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Mark an announcement as read by the student
export const markAsRead = async (req, res) => {
    try {
        const { announcementId } = req.params;
        const studentId = req.user._id;

        const announcement = await Announcement.findByIdAndUpdate(
            announcementId,
            { $addToSet: { readBy: studentId } }, // Add to set prevents duplicates
            { new: true }
        );

        if (!announcement) {
            return res.status(404).json({ success: false, message: "Announcement not found" });
        }

        res.status(200).json({
            success: true,
            message: "Marked as read"
        });

    } catch (error) {
        console.error("Mark Read Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Get unread counts for a student across all their enrolled courses
// This is a bit complex. We need to find all announcements for courses the student is enrolled in,
// BUT exclude the ones where their ID is in `readBy`.
export const getUnreadCounts = async (req, res) => {
    try {
        const studentId = req.user._id;
        const { courseIds } = req.body; // Expect an array of course IDs from frontend

        if (!courseIds || !Array.isArray(courseIds)) {
            return res.status(400).json({ success: false, message: "Invalid course IDs" });
        }

        // Aggregation pipeline to group unread announcements by course
        const unreadCounts = await Announcement.aggregate([
            {
                $match: {
                    course: { $in: courseIds.map(id => new mongoose.Types.ObjectId(id)) },
                    readBy: { $ne: studentId } // Only count if student hasn't read it
                }
            },
            {
                $group: {
                    _id: "$course",
                    count: { $sum: 1 }
                }
            }
        ]);
        
        // Transform into a map: { courseId: count }
        const countsMap = {};
        unreadCounts.forEach(item => {
            countsMap[item._id] = item.count;
        });

        res.status(200).json({
            success: true,
            data: countsMap
        });

    } catch (error) {
        console.error("Get Unread Counts Error:", error);
        // Don't fail the whole app for this, just return 0s
        res.status(200).json({ success: true, data: {} }); 
    }
};

// Update an existing announcement
export const updateAnnouncement = async (req, res) => {
    try {
        const { announcementId } = req.params;
        const { title, content } = req.body;
        const teacherId = req.user._id;

        const announcement = await Announcement.findOne({ _id: announcementId, instructor: teacherId });
        if (!announcement) {
            return res.status(404).json({ success: false, message: "Announcement not found or unauthorized." });
        }

        announcement.title = title || announcement.title;
        if (content) announcement.content = content;

        await announcement.save();

        res.status(200).json({
            success: true,
            data: announcement,
            message: "Announcement updated successfully!"
        });
    } catch (error) {
        console.error("Update Announcement Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Delete an announcement
export const deleteAnnouncement = async (req, res) => {
    try {
        const { announcementId } = req.params;
        const teacherId = req.user._id;

        const announcement = await Announcement.findOneAndDelete({ _id: announcementId, instructor: teacherId });
        if (!announcement) {
            return res.status(404).json({ success: false, message: "Announcement not found or unauthorized." });
        }

        res.status(200).json({
            success: true,
            message: "Announcement deleted successfully!"
        });
    } catch (error) {
        console.error("Delete Announcement Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
