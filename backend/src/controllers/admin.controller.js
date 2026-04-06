import Announcement from '../models/Announcement.js';
import ApiErrorLog from '../models/ApiErrorLog.js';
import Assignment from '../models/Assignment.js';
import AuditLog from '../models/AuditLog.js';
import Category from '../models/Category.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import LoginActivity from '../models/LoginActivity.js';
import Review from '../models/Review.js';
import School from '../models/School.js';
import Submission from '../models/Submission.js';
import User from '../models/User.js';
import {
  APPROVAL_STATUS,
  canManagePlatformConfig,
  canManageUsers,
  COURSE_STATUS,
  ROLES,
  USER_STATUS
} from '../config/roles.js';
import { logAdminAction } from '../services/admin-log.service.js';
import { sendError, sendSuccess } from '../utils/response.js';

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseBooleanQuery = (value) => {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  const normalized = String(value).toLowerCase();

  if (normalized === 'true') {
    return true;
  }

  if (normalized === 'false') {
    return false;
  }

  return undefined;
};

const getPagination = (query, defaultLimit = 10) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || defaultLimit, 1), 100);

  return {
    page,
    limit,
    skip: (page - 1) * limit
  };
};

const getLectureCount = (course) => (
  course.parts || []
).reduce((total, part) => total + (part.lectures?.length || 0), 0);

const getProgressValues = (progress) => {
  if (!progress) {
    return [];
  }

  if (progress instanceof Map) {
    return Array.from(progress.values());
  }

  if (typeof progress === 'object') {
    return Object.values(progress);
  }

  return [];
};

const calculateCompletionRate = (course, enrollments) => {
  const totalLectures = getLectureCount(course);

  if (!totalLectures || !enrollments.length) {
    return 0;
  }

  const totalRate = enrollments.reduce((sum, enrollment) => {
    const completedLectures = getProgressValues(enrollment.progress).filter(Boolean).length;
    return sum + (completedLectures / totalLectures) * 100;
  }, 0);

  return Number((totalRate / enrollments.length).toFixed(1));
};

const buildMonthlySeries = (dates = [], months = 6) => {
  const formatter = new Intl.DateTimeFormat('en-US', { month: 'short' });
  const buckets = [];
  const dateMap = new Map();

  for (let index = months - 1; index >= 0; index -= 1) {
    const current = new Date();
    current.setDate(1);
    current.setHours(0, 0, 0, 0);
    current.setMonth(current.getMonth() - index);

    const key = `${current.getFullYear()}-${current.getMonth()}`;
    const label = `${formatter.format(current)} ${String(current.getFullYear()).slice(-2)}`;
    const bucket = { key, label, value: 0 };
    buckets.push(bucket);
    dateMap.set(key, bucket);
  }

  dates.forEach((item) => {
    const date = new Date(item);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const target = dateMap.get(key);

    if (target) {
      target.value += 1;
    }
  });

  return buckets.map(({ label, value }) => ({ label, value }));
};

const getAnnouncementState = (scheduledFor, status) => {
  if (status === 'draft') {
    return {
      status: 'draft',
      scheduledFor: undefined,
      publishedAt: undefined
    };
  }

  if (status === 'archived') {
    return {
      status: 'archived',
      publishedAt: undefined,
      scheduledFor: undefined
    };
  }

  if (scheduledFor) {
    const scheduleDate = new Date(scheduledFor);
    if (!Number.isNaN(scheduleDate.getTime()) && scheduleDate > new Date()) {
      return {
        status: 'scheduled',
        scheduledFor: scheduleDate,
        publishedAt: undefined
      };
    }
  }

  return {
    status: 'published',
    scheduledFor: undefined,
    publishedAt: new Date()
  };
};

const summarizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  school: user.school,
  status: user.status,
  approvalStatus: user.approvalStatus,
  lastLoginAt: user.lastLoginAt,
  personId: user.personId,
  createdAt: user.createdAt
});

export const getDashboard = async (req, res) => {
  try {
    const [
      allUsers,
      totalCourses,
      pendingCourses,
      totalEnrollments,
      reviewAggregation,
      recentActivity,
      allCourses,
      schoolsCount,
      categoriesCount
    ] = await Promise.all([
      User.find({
        role: { $in: [ROLES.STUDENT, ROLES.TEACHER] }
      }).select('createdAt role status school'),
      Course.countDocuments(),
      Course.countDocuments({ status: COURSE_STATUS.PENDING }),
      Enrollment.countDocuments(),
      Review.aggregate([
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' }
          }
        }
      ]),
      AuditLog.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Course.find()
        .select('name category status stats instructor isFeatured createdAt parts')
        .populate('instructor', 'name')
        .lean(),
      School.countDocuments(),
      Category.countDocuments()
    ]);

    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter((user) => user.status === USER_STATUS.ACTIVE).length;
    const monthlyUserGrowth = buildMonthlySeries(allUsers.map((user) => user.createdAt), 6);

    const categoryMap = new Map();
    allCourses.forEach((course) => {
      const key = course.category || 'Uncategorized';
      categoryMap.set(key, (categoryMap.get(key) || 0) + 1);
    });

    const categoryDistribution = Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 6);

    const courseIds = allCourses.map((course) => course._id);
    const [enrollments, reviewStats] = await Promise.all([
      Enrollment.find({ course: { $in: courseIds } }).lean(),
      Review.aggregate([
        {
          $group: {
            _id: '$course',
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
          }
        }
      ])
    ]);

    const enrollmentsByCourse = new Map();
    enrollments.forEach((enrollment) => {
      const key = String(enrollment.course);
      const current = enrollmentsByCourse.get(key) || [];
      current.push(enrollment);
      enrollmentsByCourse.set(key, current);
    });

    const reviewStatsByCourse = new Map(
      reviewStats.map((item) => [
        String(item._id),
        {
          averageRating: Number((item.averageRating || 0).toFixed(1)),
          totalReviews: item.totalReviews
        }
      ])
    );

    const courseEngagement = allCourses
      .map((course) => {
        const enrollmentList = enrollmentsByCourse.get(String(course._id)) || [];
        return {
          name: course.name,
          enrollments: enrollmentList.length,
          completionRate: calculateCompletionRate(course, enrollmentList)
        };
      })
      .sort((left, right) => right.enrollments - left.enrollments)
      .slice(0, 6);

    const topPerformingCourses = allCourses
      .map((course) => {
        const reviews = reviewStatsByCourse.get(String(course._id)) || {
          averageRating: Number(course.stats?.rating || 0),
          totalReviews: Number(course.stats?.reviews || 0)
        };
        const enrollmentList = enrollmentsByCourse.get(String(course._id)) || [];

        return {
          _id: course._id,
          name: course.name,
          category: course.category,
          instructor: course.instructor?.name || 'Unknown',
          status: course.status,
          isFeatured: course.isFeatured,
          enrollments: enrollmentList.length,
          averageRating: reviews.averageRating,
          totalReviews: reviews.totalReviews
        };
      })
      .sort((left, right) => {
        if (right.enrollments !== left.enrollments) {
          return right.enrollments - left.enrollments;
        }

        return right.averageRating - left.averageRating;
      })
      .slice(0, 5);

    return sendSuccess(res, 200, {
      metrics: {
        totalUsers,
        activeUsers,
        totalCourses,
        pendingCourses,
        totalEnrollments,
        averageRatings: Number((reviewAggregation[0]?.averageRating || 0).toFixed(1))
      },
      charts: {
        monthlyUserGrowth,
        courseEngagement,
        categoryDistribution
      },
      recentActivity,
      topPerformingCourses,
      organization: {
        totalSchools: schoolsCount,
        totalCategories: categoriesCount
      }
    }, 'Admin dashboard retrieved successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const getUsers = async (req, res) => {
  try {
    const {
      role,
      status,
      school,
      approvalStatus,
      search = ''
    } = req.query;
    const { page, limit, skip } = getPagination(req.query, 12);
    const filters = {};

    if (role && role !== 'all') {
      filters.role = role;
    }

    if (status && status !== 'all') {
      filters.status = status;
    }

    if (school && school !== 'all') {
      filters.school = school;
    }

    if (approvalStatus && approvalStatus !== 'all') {
      filters.approvalStatus = approvalStatus;
    }

    const trimmedSearch = search.trim();
    if (trimmedSearch) {
      const safeSearch = escapeRegex(trimmedSearch);
      filters.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { email: { $regex: safeSearch, $options: 'i' } },
        { personId: { $regex: safeSearch, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filters)
        .select('name email phone role school status approvalStatus lastLoginAt personId createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filters)
    ]);

    return sendSuccess(res, 200, {
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    }, 'Users retrieved successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('enrolledCourses', 'name slug category status thumbnail stats')
      .lean();

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    const [createdCourses, auditLogs, loginActivity] = await Promise.all([
      Course.find({ instructor: user._id })
        .select('name category status isFeatured createdAt stats')
        .lean(),
      AuditLog.find({
        $or: [
          { 'actor.id': user._id },
          { entityId: String(user._id) }
        ]
      })
        .sort({ createdAt: -1 })
        .limit(15)
        .lean(),
      LoginActivity.find({
        $or: [
          { user: user._id },
          { email: user.email }
        ]
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
    ]);

    return sendSuccess(res, 200, {
      profile: user,
      createdCourses,
      activityLogs: auditLogs,
      loginActivity
    }, 'User profile retrieved successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    if (!canManageUsers(req.user.role)) {
      return sendError(res, 403, 'Only Admin or Super Admin can change user status');
    }

    const { status } = req.body;

    if (!Object.values(USER_STATUS).includes(status)) {
      return sendError(res, 400, 'Invalid user status');
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    if (user.role === ROLES.SUPER_ADMIN && req.user.role !== ROLES.SUPER_ADMIN) {
      return sendError(res, 403, 'Only Super Admin can manage another Super Admin');
    }

    user.status = status;
    await user.save({ validateBeforeSave: false });

    await logAdminAction({
      actor: req.user,
      action: `user_status_${status}`,
      module: 'users',
      entityType: 'User',
      entityId: user._id,
      targetLabel: user.email,
      details: { status },
      req
    });

    return sendSuccess(res, 200, summarizeUser(user), 'User status updated successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const updateUserApproval = async (req, res) => {
  try {
    const { approvalStatus, note = '' } = req.body;

    if (![APPROVAL_STATUS.APPROVED, APPROVAL_STATUS.REJECTED, APPROVAL_STATUS.PENDING].includes(approvalStatus)) {
      return sendError(res, 400, 'Invalid approval status');
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    user.approvalStatus = approvalStatus;
    user.approvalNote = note;
    user.approvedBy = approvalStatus === APPROVAL_STATUS.APPROVED ? req.user._id : undefined;
    user.approvedAt = approvalStatus === APPROVAL_STATUS.APPROVED ? new Date() : undefined;

    if (approvalStatus === APPROVAL_STATUS.APPROVED) {
      user.status = USER_STATUS.ACTIVE;
    }

    if (approvalStatus === APPROVAL_STATUS.REJECTED) {
      user.status = USER_STATUS.INACTIVE;
    }

    await user.save({ validateBeforeSave: false });

    await logAdminAction({
      actor: req.user,
      action: `user_approval_${approvalStatus}`,
      module: 'users',
      entityType: 'User',
      entityId: user._id,
      targetLabel: user.email,
      details: { approvalStatus, note },
      req
    });

    return sendSuccess(res, 200, summarizeUser(user), 'User approval updated successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const bulkUpdateUsers = async (req, res) => {
  try {
    const { userIds = [], action, note = '' } = req.body;

    if (!Array.isArray(userIds) || !userIds.length) {
      return sendError(res, 400, 'Please provide at least one user id');
    }

    if (!canManageUsers(req.user.role) && !['approve', 'reject'].includes(action)) {
      return sendError(res, 403, 'You do not have permission to perform this bulk action');
    }

    const users = await User.find({ _id: { $in: userIds } });

    if (!users.length) {
      return sendError(res, 404, 'No users found for the selected ids');
    }

    if (users.some((user) => user.role === ROLES.SUPER_ADMIN) && req.user.role !== ROLES.SUPER_ADMIN) {
      return sendError(res, 403, 'Only Super Admin can manage another Super Admin');
    }

    for (const user of users) {
      switch (action) {
        case 'activate':
          user.status = USER_STATUS.ACTIVE;
          break;
        case 'suspend':
          user.status = USER_STATUS.SUSPENDED;
          break;
        case 'approve':
          user.approvalStatus = APPROVAL_STATUS.APPROVED;
          user.approvedBy = req.user._id;
          user.approvedAt = new Date();
          user.approvalNote = note;
          user.status = USER_STATUS.ACTIVE;
          break;
        case 'reject':
          user.approvalStatus = APPROVAL_STATUS.REJECTED;
          user.approvalNote = note;
          user.status = USER_STATUS.INACTIVE;
          break;
        case 'delete':
          if (!canManageUsers(req.user.role)) {
            return sendError(res, 403, 'Only Admin or Super Admin can delete users');
          }
          break;
        default:
          return sendError(res, 400, 'Unsupported bulk action');
      }
    }

    if (action === 'delete') {
      await User.deleteMany({ _id: { $in: userIds } });
    } else {
      await Promise.all(users.map((user) => user.save({ validateBeforeSave: false })));
    }

    await logAdminAction({
      actor: req.user,
      action: `bulk_user_${action}`,
      module: 'users',
      entityType: 'User',
      entityId: userIds.join(','),
      targetLabel: `${userIds.length} users`,
      details: { action, userIds, note },
      req
    });

    return sendSuccess(res, 200, {
      affectedCount: userIds.length,
      action
    }, 'Bulk user action completed successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (!canManageUsers(req.user.role)) {
      return sendError(res, 403, 'Only Admin or Super Admin can delete users');
    }

    if (String(req.user._id) === req.params.userId) {
      return sendError(res, 400, 'You cannot delete your own account');
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    if (user.role === ROLES.SUPER_ADMIN && req.user.role !== ROLES.SUPER_ADMIN) {
      return sendError(res, 403, 'Only Super Admin can delete another Super Admin');
    }

    await User.deleteOne({ _id: user._id });

    await logAdminAction({
      actor: req.user,
      action: 'user_deleted',
      module: 'users',
      entityType: 'User',
      entityId: user._id,
      targetLabel: user.email,
      details: { role: user.role },
      req
    });

    return sendSuccess(res, 200, { _id: user._id }, 'User deleted successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const getCourses = async (req, res) => {
  try {
    const {
      search = '',
      status,
      category,
      featured,
      instructor
    } = req.query;
    const { page, limit, skip } = getPagination(req.query, 10);
    const filters = {};

    if (status && status !== 'all') {
      filters.status = status;
    }

    if (category && category !== 'all') {
      filters.category = category;
    }

    if (instructor) {
      filters.instructor = instructor;
    }

    const featuredQuery = parseBooleanQuery(featured);
    if (featuredQuery !== undefined) {
      filters.isFeatured = featuredQuery;
    }

    const trimmedSearch = search.trim();
    if (trimmedSearch) {
      const safeSearch = escapeRegex(trimmedSearch);
      filters.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { subtitle: { $regex: safeSearch, $options: 'i' } },
        { category: { $regex: safeSearch, $options: 'i' } }
      ];
    }

    const [courses, total] = await Promise.all([
      Course.find(filters)
        .populate('instructor', 'name email school')
        .populate('reviewedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Course.countDocuments(filters)
    ]);

    const [reviewStats, enrollmentStats] = await Promise.all([
      Review.aggregate([
        {
          $group: {
            _id: '$course',
            averageRating: { $avg: '$rating' },
            reviews: { $sum: 1 }
          }
        }
      ]),
      Enrollment.aggregate([
        {
          $group: {
            _id: '$course',
            enrollments: { $sum: 1 }
          }
        }
      ])
    ]);

    const reviewMap = new Map(reviewStats.map((item) => [String(item._id), item]));
    const enrollmentMap = new Map(enrollmentStats.map((item) => [String(item._id), item.enrollments]));

    const data = courses.map((course) => ({
      ...course,
      ratings: Number((reviewMap.get(String(course._id))?.averageRating || course.stats?.rating || 0).toFixed(1)),
      reviewCount: reviewMap.get(String(course._id))?.reviews || course.stats?.reviews || 0,
      enrollments: enrollmentMap.get(String(course._id)) || course.enrolledStudents?.length || 0
    }));

    return sendSuccess(res, 200, {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    }, 'Courses retrieved successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const reviewCourse = async (req, res) => {
  try {
    const { status, reason = '' } = req.body;

    if (![COURSE_STATUS.APPROVED, COURSE_STATUS.REJECTED].includes(status)) {
      return sendError(res, 400, 'Review status must be approved or rejected');
    }

    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return sendError(res, 404, 'Course not found');
    }

    course.status = status;
    course.rejectionReason = status === COURSE_STATUS.REJECTED ? reason : '';
    course.reviewedBy = req.user._id;
    course.reviewedAt = new Date();
    await course.save();

    await logAdminAction({
      actor: req.user,
      action: `course_${status}`,
      module: 'courses',
      entityType: 'Course',
      entityId: course._id,
      targetLabel: course.name,
      details: { status, reason },
      req
    });

    return sendSuccess(res, 200, course, 'Course review updated successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const updateCourse = async (req, res) => {
  try {
    const allowedFields = [
      'name',
      'category',
      'subtitle',
      'description',
      'provider',
      'price',
      'thumbnail',
      'whatYouLearn'
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const course = await Course.findByIdAndUpdate(req.params.courseId, updates, {
      new: true,
      runValidators: true
    });

    if (!course) {
      return sendError(res, 404, 'Course not found');
    }

    await logAdminAction({
      actor: req.user,
      action: 'course_updated',
      module: 'courses',
      entityType: 'Course',
      entityId: course._id,
      targetLabel: course.name,
      details: updates,
      req
    });

    return sendSuccess(res, 200, course, 'Course metadata updated successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const toggleFeaturedCourse = async (req, res) => {
  try {
    const { isFeatured } = req.body;

    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return sendError(res, 404, 'Course not found');
    }

    course.isFeatured = Boolean(isFeatured);
    course.featuredAt = course.isFeatured ? new Date() : undefined;
    await course.save();

    await logAdminAction({
      actor: req.user,
      action: course.isFeatured ? 'course_featured' : 'course_unfeatured',
      module: 'courses',
      entityType: 'Course',
      entityId: course._id,
      targetLabel: course.name,
      details: { isFeatured: course.isFeatured },
      req
    });

    return sendSuccess(res, 200, course, 'Featured state updated successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const archiveCourse = async (req, res) => {
  try {
    const { archived = true } = req.body;

    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return sendError(res, 404, 'Course not found');
    }

    course.status = archived ? COURSE_STATUS.ARCHIVED : COURSE_STATUS.APPROVED;
    course.archivedAt = archived ? new Date() : undefined;
    await course.save();

    await logAdminAction({
      actor: req.user,
      action: archived ? 'course_archived' : 'course_restored',
      module: 'courses',
      entityType: 'Course',
      entityId: course._id,
      targetLabel: course.name,
      details: { archived },
      req
    });

    return sendSuccess(res, 200, course, 'Archive state updated successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const getAdminAnnouncements = async (req, res) => {
  try {
    const filters = { type: 'platform' };

    if (req.query.status && req.query.status !== 'all') {
      filters.status = req.query.status;
    }

    const announcements = await Announcement.find(filters)
      .populate('createdBy', 'name role')
      .populate('audience.courseIds', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, 200, announcements, 'Announcements retrieved successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const createAdminAnnouncement = async (req, res) => {
  try {
    const { title, content, audience = {}, scheduledFor, channel, priority, status } = req.body;
    const state = getAnnouncementState(scheduledFor, status);

    const announcement = await Announcement.create({
      type: 'platform',
      title,
      content,
      audience: {
        schools: audience.schools || [],
        courseIds: audience.courseIds || [],
        roles: audience.roles || []
      },
      channel: channel || 'banner',
      priority: priority || 'normal',
      createdBy: req.user._id,
      ...state
    });

    await logAdminAction({
      actor: req.user,
      action: 'announcement_created',
      module: 'communication',
      entityType: 'Announcement',
      entityId: announcement._id,
      targetLabel: announcement.title,
      details: {
        channel: announcement.channel,
        priority: announcement.priority,
        status: announcement.status
      },
      req
    });

    return sendSuccess(res, 201, announcement, 'Announcement created successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const updateAdminAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findOne({
      _id: req.params.announcementId,
      type: 'platform'
    });

    if (!announcement) {
      return sendError(res, 404, 'Announcement not found');
    }

    const { title, content, audience = {}, scheduledFor, channel, priority, status } = req.body;
    const state = getAnnouncementState(scheduledFor, status);

    if (title !== undefined) announcement.title = title;
    if (content !== undefined) announcement.content = content;
    if (channel !== undefined) announcement.channel = channel;
    if (priority !== undefined) announcement.priority = priority;
    if (req.body.audience !== undefined) {
      announcement.audience = {
        schools: audience.schools || [],
        courseIds: audience.courseIds || [],
        roles: audience.roles || []
      };
    }

    announcement.status = state.status;
    announcement.scheduledFor = state.scheduledFor;
    announcement.publishedAt = state.publishedAt;
    await announcement.save();

    await logAdminAction({
      actor: req.user,
      action: 'announcement_updated',
      module: 'communication',
      entityType: 'Announcement',
      entityId: announcement._id,
      targetLabel: announcement.title,
      details: { status: announcement.status },
      req
    });

    return sendSuccess(res, 200, announcement, 'Announcement updated successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const deleteAdminAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findOneAndDelete({
      _id: req.params.announcementId,
      type: 'platform'
    });

    if (!announcement) {
      return sendError(res, 404, 'Announcement not found');
    }

    await logAdminAction({
      actor: req.user,
      action: 'announcement_deleted',
      module: 'communication',
      entityType: 'Announcement',
      entityId: announcement._id,
      targetLabel: announcement.title,
      req
    });

    return sendSuccess(res, 200, { _id: announcement._id }, 'Announcement deleted successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const [courses, enrollments, reviews, assignments, submissions] = await Promise.all([
      Course.find()
        .select('name category status parts')
        .lean(),
      Enrollment.find().lean(),
      Review.find().lean(),
      Assignment.find().lean(),
      Submission.find().lean()
    ]);

    const enrollmentsByCourse = new Map();
    enrollments.forEach((enrollment) => {
      const key = String(enrollment.course);
      const current = enrollmentsByCourse.get(key) || [];
      current.push(enrollment);
      enrollmentsByCourse.set(key, current);
    });

    const reviewsByCourse = new Map();
    reviews.forEach((review) => {
      const key = String(review.course);
      const current = reviewsByCourse.get(key) || [];
      current.push(review);
      reviewsByCourse.set(key, current);
    });

    const assignmentsByCourse = new Map();
    assignments.forEach((assignment) => {
      const key = String(assignment.course);
      const current = assignmentsByCourse.get(key) || [];
      current.push(assignment);
      assignmentsByCourse.set(key, current);
    });

    const submissionsByAssignment = new Map();
    submissions.forEach((submission) => {
      const key = String(submission.assignment);
      const current = submissionsByAssignment.get(key) || [];
      current.push(submission);
      submissionsByAssignment.set(key, current);
    });

    const coursePerformance = courses.map((course) => {
      const courseEnrollments = enrollmentsByCourse.get(String(course._id)) || [];
      const courseReviews = reviewsByCourse.get(String(course._id)) || [];
      const courseAssignments = assignmentsByCourse.get(String(course._id)) || [];
      const completionRate = calculateCompletionRate(course, courseEnrollments);

      const submittedAssignments = courseAssignments.reduce((count, assignment) => {
        const assignmentSubmissions = submissionsByAssignment.get(String(assignment._id)) || [];
        return count + assignmentSubmissions.filter((submission) => submission.status !== 'draft').length;
      }, 0);

      const submissionDenominator = courseAssignments.length * Math.max(courseEnrollments.length, 1);
      const assignmentSubmissionRate = submissionDenominator
        ? Number(((submittedAssignments / submissionDenominator) * 100).toFixed(1))
        : 0;

      const averageRating = courseReviews.length
        ? Number((courseReviews.reduce((sum, review) => sum + review.rating, 0) / courseReviews.length).toFixed(1))
        : 0;

      return {
        _id: course._id,
        name: course.name,
        category: course.category,
        status: course.status,
        enrollments: courseEnrollments.length,
        averageRating,
        completionRate,
        dropOffRate: Number((100 - completionRate).toFixed(1)),
        assignmentSubmissionRate
      };
    })
      .sort((left, right) => right.enrollments - left.enrollments);

    const studentEngagementTrend = buildMonthlySeries(
      enrollments.map((enrollment) => enrollment.lastAccessedAt || enrollment.enrolledAt),
      6
    );

    const overallCompletionRate = coursePerformance.length
      ? Number((
        coursePerformance.reduce((sum, course) => sum + course.completionRate, 0) / coursePerformance.length
      ).toFixed(1))
      : 0;

    return sendSuccess(res, 200, {
      summary: {
        overallCompletionRate,
        overallDropOffRate: Number((100 - overallCompletionRate).toFixed(1)),
        averageAssignmentSubmissionRate: coursePerformance.length
          ? Number((
            coursePerformance.reduce((sum, course) => sum + course.assignmentSubmissionRate, 0) / coursePerformance.length
          ).toFixed(1))
          : 0
      },
      coursePerformance,
      studentEngagementTrend,
      assignmentSubmissionRates: coursePerformance.map((course) => ({
        name: course.name,
        assignmentSubmissionRate: course.assignmentSubmissionRate
      }))
    }, 'Analytics retrieved successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const getSecurityMonitoring = async (req, res) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      recentLoginActivity,
      suspiciousActivity,
      apiErrors,
      adminActions,
      totalLoginAttempts,
      failedLoginAttempts
    ] = await Promise.all([
      LoginActivity.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('user', 'name email role')
        .lean(),
      LoginActivity.find({ suspicious: true })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('user', 'name email role')
        .lean(),
      ApiErrorLog.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('actor', 'name email role')
        .lean(),
      AuditLog.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      LoginActivity.countDocuments({ createdAt: { $gte: since } }),
      LoginActivity.countDocuments({ createdAt: { $gte: since }, status: 'failure' })
    ]);

    return sendSuccess(res, 200, {
      summary: {
        totalLoginAttempts,
        failedLoginAttempts,
        suspiciousAttempts: suspiciousActivity.filter((item) => new Date(item.createdAt) >= since).length,
        apiErrors: apiErrors.filter((item) => new Date(item.createdAt) >= since).length
      },
      recentLoginActivity,
      suspiciousActivity,
      apiErrors,
      adminActions
    }, 'Security monitoring retrieved successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const getSchools = async (req, res) => {
  try {
    const schools = await School.find().sort({ code: 1 }).lean();
    return sendSuccess(res, 200, schools, 'Schools retrieved successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const createSchool = async (req, res) => {
  try {
    if (!canManagePlatformConfig(req.user.role)) {
      return sendError(res, 403, 'Only Super Admin can manage schools');
    }

    const school = await School.create({
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id
    });

    await logAdminAction({
      actor: req.user,
      action: 'school_created',
      module: 'settings',
      entityType: 'School',
      entityId: school._id,
      targetLabel: school.code,
      details: { name: school.name },
      req
    });

    return sendSuccess(res, 201, school, 'School created successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const updateSchool = async (req, res) => {
  try {
    if (!canManagePlatformConfig(req.user.role)) {
      return sendError(res, 403, 'Only Super Admin can manage schools');
    }

    const school = await School.findByIdAndUpdate(
      req.params.schoolId,
      {
        ...req.body,
        updatedBy: req.user._id,
        updatedAt: new Date()
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!school) {
      return sendError(res, 404, 'School not found');
    }

    await logAdminAction({
      actor: req.user,
      action: 'school_updated',
      module: 'settings',
      entityType: 'School',
      entityId: school._id,
      targetLabel: school.code,
      details: req.body,
      req
    });

    return sendSuccess(res, 200, school, 'School updated successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const deleteSchool = async (req, res) => {
  try {
    if (!canManagePlatformConfig(req.user.role)) {
      return sendError(res, 403, 'Only Super Admin can manage schools');
    }

    const school = await School.findByIdAndDelete(req.params.schoolId);

    if (!school) {
      return sendError(res, 404, 'School not found');
    }

    await logAdminAction({
      actor: req.user,
      action: 'school_deleted',
      module: 'settings',
      entityType: 'School',
      entityId: school._id,
      targetLabel: school.code,
      req
    });

    return sendSuccess(res, 200, { _id: school._id }, 'School deleted successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
    return sendSuccess(res, 200, categories, 'Categories retrieved successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const createCategory = async (req, res) => {
  try {
    if (!canManagePlatformConfig(req.user.role)) {
      return sendError(res, 403, 'Only Super Admin can manage categories');
    }

    const category = await Category.create({
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id
    });

    await logAdminAction({
      actor: req.user,
      action: 'category_created',
      module: 'settings',
      entityType: 'Category',
      entityId: category._id,
      targetLabel: category.name,
      details: req.body,
      req
    });

    return sendSuccess(res, 201, category, 'Category created successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const updateCategory = async (req, res) => {
  try {
    if (!canManagePlatformConfig(req.user.role)) {
      return sendError(res, 403, 'Only Super Admin can manage categories');
    }

    const category = await Category.findByIdAndUpdate(
      req.params.categoryId,
      {
        ...req.body,
        updatedBy: req.user._id,
        updatedAt: new Date()
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    await logAdminAction({
      actor: req.user,
      action: 'category_updated',
      module: 'settings',
      entityType: 'Category',
      entityId: category._id,
      targetLabel: category.name,
      details: req.body,
      req
    });

    return sendSuccess(res, 200, category, 'Category updated successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const deleteCategory = async (req, res) => {
  try {
    if (!canManagePlatformConfig(req.user.role)) {
      return sendError(res, 403, 'Only Super Admin can manage categories');
    }

    const category = await Category.findByIdAndDelete(req.params.categoryId);

    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    await logAdminAction({
      actor: req.user,
      action: 'category_deleted',
      module: 'settings',
      entityType: 'Category',
      entityId: category._id,
      targetLabel: category.name,
      req
    });

    return sendSuccess(res, 200, { _id: category._id }, 'Category deleted successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};
