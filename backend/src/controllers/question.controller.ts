import Question from '../models/Question.js';
import Course from '../models/Course.js';

const QUESTION_STATUSES = ['open', 'completed'];

// Create Question (Student)
export const createQuestion = async (req, res) => {
    try {
        const { courseId, title, description } = req.body;
        const studentId = req.user._id;

        let imageUrl = '';
        if (req.file) {
            imageUrl = `/uploads/questions/${req.file.filename}`;
        }

        const question = new Question({
            student: studentId,
            course: courseId,
            title,
            description,
            imageUrl
        });

        await question.save();

        res.status(201).json({
            success: true,
            data: question,
            message: 'Question posted successfully'
        });
    } catch (error) {
        console.error('Create Question Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get Questions for a Course
export const getQuestions = async (req, res) => {
    try {
        const { courseId } = req.params;
        
        const questions = await Question.find({ course: courseId })
            .populate('student', 'name email image')
            .populate('answers.user', 'name role image')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: questions
        });
    } catch (error) {
        console.error('Get Questions Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Add Answer (Teacher/Student)
export const addAnswer = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { content } = req.body;
        const userId = req.user._id;

        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        question.answers.push({
            user: userId,
            content
        });

        await question.save();
        
        // Re-populate for response
        await question.populate('answers.user', 'name role image');

        res.status(200).json({
            success: true,
            message: 'Answer added',
            data: question
        });
    } catch (error) {
        console.error('Add Answer Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Toggle Status (Teacher)
export const toggleStatus = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { status } = req.body;

        if (!QUESTION_STATUSES.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        const course = await Course.findById(question.course);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this question' });
        }

        question.status = status;
        await question.save();

        res.status(200).json({
            success: true,
            message: `Question marked as ${status}`,
            data: question
        });
    } catch (error) {
        console.error('Toggle Status Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
