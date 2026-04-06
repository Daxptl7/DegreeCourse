import Course from '../models/Course.js';
import { COURSE_STATUS, ROLES } from '../config/roles.js';

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const COURSE_SORT_OPTIONS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  priceLowToHigh: { price: 1 },
  priceHighToLow: { price: -1 },
  ratingHighToLow: { 'stats.rating': -1 },
  ratingLowToHigh: { 'stats.rating': 1 }
};

export const createCourse = async (req, res) => {
  try {
    const course = await Course.create({
      ...req.body,
      instructor: req.user.id,
      status: COURSE_STATUS.PENDING
    });

    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const addSection = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.instructor.toString() !== req.user.id && ![ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(req.user.role)) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    course.parts.push(req.body);
    await course.save();

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const addLecture = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.instructor.toString() !== req.user.id && ![ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(req.user.role)) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    const section = course.parts.id(req.params.sectionId);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    let lectureData = { ...req.body };

    // Handle file upload
    if (req.file) {
      lectureData.videoUrl = `/uploads/videos/${req.file.filename}`;
      // Map other fields that might come as text in multipart form
      // e.g., duration, title, etc. are already in req.body
    }

    section.lectures.push(lectureData);
    await course.save();

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const {
      search = '',
      category = 'All',
      school = '',
      sort = 'newest',
      page = '1',
      limit = '9'
    } = req.query;

    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 9, 1), 50);
    const filters = { status: 'approved' };

    if (school && school !== 'All') {
      filters.category = school;
    }

    if (category && category !== 'All') {
      if (filters.category && filters.category !== category) {
        return res.status(200).json({
          success: true,
          data: [],
          pagination: {
            total: 0,
            page: parsedPage,
            limit: parsedLimit,
            totalPages: 0,
            hasPrev: parsedPage > 1,
            hasNext: false
          }
        });
      }
      filters.category = category;
    }

    const trimmedSearch = search.trim();
    if (trimmedSearch) {
      const safeSearch = escapeRegex(trimmedSearch);
      filters.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { subtitle: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } },
        { provider: { $regex: safeSearch, $options: 'i' } },
        { whatYouLearn: { $regex: safeSearch, $options: 'i' } }
      ];
    }

    const sortOption = COURSE_SORT_OPTIONS[sort] || COURSE_SORT_OPTIONS.newest;
    const total = await Course.countDocuments(filters);
    const totalPages = total > 0 ? Math.ceil(total / parsedLimit) : 0;
    const safePage = totalPages > 0 ? Math.min(parsedPage, totalPages) : 1;
    const skip = (safePage - 1) * parsedLimit;

    const courses = await Course.find(filters)
      .select('name slug category price thumbnail stats instructor createdAt provider')
      .populate('instructor', 'name')
      .sort(sortOption)
      .skip(skip)
      .limit(parsedLimit);

    res.status(200).json({
      success: true,
      data: courses,
      pagination: {
        total,
        page: safePage,
        limit: parsedLimit,
        totalPages,
        hasPrev: safePage > 1,
        hasNext: safePage < totalPages
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getCourseBySlug = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug })
      .populate('instructor', 'name')
      .populate('parts.lectures');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
