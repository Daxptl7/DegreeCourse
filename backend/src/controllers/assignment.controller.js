import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Course from '../models/Course.js';

// Create Assignment
export const createAssignment = async (req, res) => {
    try {
        const { courseId, title, description, dueDate } = req.body;
        const instructorId = req.user._id;

        // Check if file is uploaded
        let fileUrl = '';
        if (req.file) {
            fileUrl = `/uploads/assignments/${req.file.filename}`;
        }

        // Verify Course Ownership
        const course = await Course.findOne({ _id: courseId, instructor: instructorId });
        if (!course) {
            return res.status(403).json({ success: false, message: 'Not authorized for this course' });
        }

        const assignment = new Assignment({
            title,
            description,
            course: courseId,
            instructor: instructorId,
            fileUrl,
            dueDate: new Date(dueDate)
        });

        await assignment.save();

        res.status(201).json({
            success: true,
            data: assignment,
            message: 'Assignment created successfully'
        });

    } catch (error) {
        console.error('Create Assignment Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get Assignments for a Course
export const getAssignments = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user._id;

        const assignments = await Assignment.find({ course: courseId }).sort({ dueDate: 1 });

        // If student, check if submitted
        let assignmentsWithStatus = [];
        // Note: For efficiency, we could parallelize or aggregate, but loop is fine for small scale
        for (let assign of assignments) {
             const submission = await Submission.findOne({ assignment: assign._id, student: userId });
             assignmentsWithStatus.push({
                 ...assign.toObject(),
                 isSubmitted: !!submission,
                 submission: submission ? submission.toObject() : null,
                 status: submission ? submission.status : null,
                 grade: submission ? submission.grade : null,
                 submittedAt: submission ? submission.submittedAt : null
             });
        }

        res.status(200).json({
            success: true,
            data: assignmentsWithStatus
        });

    } catch (error) {
        console.error('Get Assignments Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Submit Assignment
export const submitAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const studentId = req.user._id;
        const isDraft = req.body.isDraft === 'true' || req.body.isDraft === true; // form-data handles as string

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        
        const fileUrl = `/uploads/submissions/${req.file.filename}`;

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }

        // Check existing submission
        let submission = await Submission.findOne({ assignment: assignmentId, student: studentId });
        
        if (submission) {
             // If already graded, cannot resubmit
             if (submission.status === 'graded') {
                 return res.status(400).json({ success: false, message: 'Cannot update a graded submission' });
             }
             submission.fileUrl = fileUrl;
             submission.submittedAt = Date.now();
             submission.status = isDraft ? 'draft' : 'submitted';
        } else {
             submission = new Submission({
                 assignment: assignmentId,
                 student: studentId,
                 fileUrl,
                 status: isDraft ? 'draft' : 'submitted'
             });
        }

        await submission.save();

        res.status(200).json({
            success: true,
            message: 'Assignment submitted successfully',
            data: submission
        });

    } catch (error) {
        console.error('Submit Assignment Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get Submissions (Teacher)
export const getSubmissions = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        const assignment = await Assignment.findOne({
            _id: assignmentId,
            instructor: req.user._id
        });
        if (!assignment) {
            return res.status(403).json({ success: false, message: 'Not authorized for this assignment' });
        }

        const submissions = await Submission.find({ assignment: assignmentId })
            .populate('student', 'name email');

        res.status(200).json({
            success: true,
            data: submissions
        });
    } catch (error) {
        console.error('Get Submissions Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Grade Submission (Teacher)
export const gradeSubmission = async (req, res) => {
    try {
        const { assignmentId, submissionId } = req.params;
        const { grade, feedback } = req.body;
        
        // Ensure the assignment exists and belongs to the instructor
        const assignment = await Assignment.findOne({ _id: assignmentId, instructor: req.user._id });
        if (!assignment) {
            return res.status(403).json({ success: false, message: 'Not authorized for this assignment' });
        }

        const submission = await Submission.findById(submissionId);
        if (!submission || submission.assignment.toString() !== assignmentId) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        if (submission.status === 'draft') {
            return res.status(400).json({ success: false, message: 'Cannot grade a draft submission' });
        }

        submission.grade = grade;
        submission.feedback = feedback;
        submission.status = 'graded';
        submission.gradedAt = Date.now();

        await submission.save();

        res.status(200).json({
            success: true,
            message: 'Submission graded successfully',
            data: submission
        });

    } catch (error) {
        console.error('Grade Submission Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
