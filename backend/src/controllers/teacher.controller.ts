import User from '../models/User.js';
import Course from '../models/Course.js';

// Get teacher profile
export const getTeacherProfile = async (req, res) => {
    try {
        const teacher = await User.findById(req.user.id).select('-password');
        res.json({ success: true, data: teacher });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get teacher's courses
export const getTeacherCourses = async (req, res) => {
    try {
        const courses = await Course.find({ instructor: req.user.id });
        res.json({ success: true, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get teacher dashboard stats
export const getTeacherStats = async (req, res) => {
    try {
        const courses = await Course.find({ instructor: req.user.id });
        
        let totalStudents = 0;
        let totalReviews = 0;
        let sumRatings = 0;
        let ratedCourses = 0;

        const individualCourseStats = courses.map(course => {
            const courseStudents = course.enrolledStudents ? course.enrolledStudents.length : 0;
            const courseReviews = course.stats?.reviews || 0;
            const courseRating = course.stats?.rating || 0;

            totalStudents += courseStudents;
            totalReviews += courseReviews;
            
            if (courseRating > 0) {
                sumRatings += courseRating;
                ratedCourses++;
            }

            return {
                id: course._id,
                name: course.name,
                thumbnail: course.thumbnail,
                students: courseStudents,
                reviews: courseReviews,
                rating: courseRating,
                status: course.status
            };
        });

        const overallAverageRating = ratedCourses > 0 ? (sumRatings / ratedCourses).toFixed(1) : 0;

        const stats = {
            totalCourses: courses.length,
            totalStudents,
            totalReviews,
            averageRating: parseFloat(overallAverageRating),
            individualCourseStats
        };

        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
