import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

// Enroll in a course

// export const enrollCourse = async (req, res) => {
//   try {
// //
//     //this is the Things Which Seees that our function of Enrollment Not happen twise in the Code 
//     const { courseId } = req.params;
//     const userId = req.user._id;

//     const course = await Course.findById(courseId);
//     if (!course) {
//       return res.status(404).json({ success: false, message: 'Course not found' });
//     }

//     // Prevent self-enrollment (Teachers cannot enroll in their own course)
//     if (course.instructor.toString() === userId.toString()) {
//         return res.status(400).json({ success: false, message: 'You cannot enroll in your own course' });
//     }
// //
//     const user = await User.findById(userId);

//     // Check if already enrolled via User model (legacy check) or Enrollment model
//     const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId });
//     if (existingEnrollment) {
//       return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
//     }

//     // Create Enrollment Record
//     const enrollment = await Enrollment.create({
//         user: userId,
//         course: courseId,
//         progress: new Map()
//     });

//     // Add to enrolledCourses and remove from cart if present
//     if (!user.enrolledCourses.includes(courseId)) {
//         user.enrolledCourses.push(courseId);
//     }
//     user.cart = user.cart.filter(id => id.toString() !== courseId);
//     await user.save();

//     // Add user to course enrolledStudents
//     course.enrolledStudents.push(userId);
//     await course.save();

//     res.status(200).json({ success: true, message: 'Enrolled successfully', data: enrollment });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
import mongoose from 'mongoose';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { COURSE_STATUS } from '../config/roles.js'; 

export const enrollCourse = async (req, res) => {
  // 1. Start a database transaction session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // 2. Fetch course within the session to ensure atomicity
    const course = await Course.findById(courseId).session(session);
    if (!course) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // SECURITY CHECK: Ensure the course is actually approved/published
    // Prevents students from enrolling in pending or rejected courses
    if (course.status !== COURSE_STATUS.APPROVED) { 
       await session.abortTransaction();
       session.endSession();
       return res.status(400).json({ success: false, message: 'This course is not available for enrollment' });
    }

    // Prevent self-enrollment
    if (course.instructor.toString() === userId.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'Instructors cannot enroll in their own courses' });
    }

    // 3. Check for existing enrollment within the session
    const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId }).session(session);
    if (existingEnrollment) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }

    // 4. Create Enrollment Record
    // Note: create() inside a transaction requires an array of documents
    const [enrollment] = await Enrollment.create([{
        user: userId,
        course: courseId,
        progress: new Map()
    }], { session });

    // 5. Update User Document efficiently
    // DATA LEAKAGE PREVENTION: We use findByIdAndUpdate instead of fetching the whole user.
    // This prevents pulling sensitive data (like the password hash or phone number) into server memory.
    await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: { enrolledCourses: courseId }, // Prevents duplicate IDs
        $pull: { cart: courseId }                 // Removes from cart automatically
      },
      { session }
    );

    // 6. Update Course Document
    await Course.findByIdAndUpdate(
      courseId,
      {
        $addToSet: { enrolledStudents: userId }
      },
      { session }
    );

    // 7. Commit everything if no errors occurred
    await session.commitTransaction();
    session.endSession();

    // DATA LEAKAGE PREVENTION: Do not return the entire enrollment or user object
    res.status(200).json({ 
      success: true, 
      message: 'Enrolled successfully', 
      data: {
        enrollmentId: enrollment._id,
        courseId: enrollment.course,
        enrolledAt: enrollment.enrolledAt
      } 
    });

  } catch (error) {
    // If ANY step fails, roll back all database changes
    await session.abortTransaction();
    session.endSession();
    
    // DATA LEAKAGE PREVENTION: Do not send raw database error messages to the client
    console.error('Enrollment Error:', error); 
    res.status(500).json({ success: false, message: 'An internal error occurred during enrollment' });
  }
};
// Toggle Lecture Progress
export const toggleLectureProgress = async (req, res) => {
    try {
        const { courseId, lectureId } = req.params;
        const userId = req.user._id;
        // const { completed } = req.body; // Can accept generic status, but simple toggle is requested

        let enrollment = await Enrollment.findOne({ user: userId, course: courseId });
        
        if (!enrollment) {
             // Fallback: If user is enrolled in User model but no Enrollment doc exists (migration case), create it
             const user = await User.findById(userId);
             if (user.enrolledCourses.includes(courseId)) {
                 enrollment = await Enrollment.create({
                     user: userId,
                     course: courseId
                 });
             } else {
                 return res.status(404).json({ success: false, message: 'Enrollment not found' });
             }
        }

        // Toggle progress
        const currentStatus = enrollment.progress.get(lectureId) || false;
        enrollment.progress.set(lectureId, !currentStatus);
        enrollment.lastAccessedAt = Date.now();
        await enrollment.save();

        res.status(200).json({ 
            success: true, 
            message: 'Progress updated', 
            data: { 
                lectureId, 
                completed: !currentStatus, 
                progressMap: enrollment.progress 
            } 
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Course Progress (Enrollment details)
export const getCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user._id;

        const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
        if (!enrollment) {
            return res.status(404).json({ success: false, message: 'Not enrolled' });
        }

        res.status(200).json({ success: true, data: enrollment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add to Cart
export const addToCart = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);

    // Check if already enrolled
    if (user.enrolledCourses.includes(courseId)) {
      return res.status(400).json({ success: false, message: 'You are already enrolled in this course' });
    }

    // Check if already in cart
    if (user.cart.includes(courseId)) {
      return res.status(400).json({ success: false, message: 'Course is already in your cart' });
    }

    user.cart.push(courseId);
    await user.save();

    res.status(200).json({ success: true, message: 'Added to cart', data: user.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove from Cart
export const removeFromCart = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    user.cart = user.cart.filter(id => id.toString() !== courseId);
    await user.save();

    res.status(200).json({ success: true, message: 'Removed from cart', data: user.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('cart', 'name slug price thumbnail instructor provider');
    
    res.status(200).json({ success: true, data: user.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Enrolled Courses (My Learning)
export const getEnrolledCourses = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).populate('enrolledCourses', 'name slug price thumbnail stats instructor provider');
        // Ideally we should also populate progress here, but for now just the list is fine
        res.status(200).json({ success: true, data: user.enrolledCourses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
