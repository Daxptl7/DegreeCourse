import { useEffect, useState } from 'react';
import adminService from '../services/api/adminService';

const initialUsersState = {
  data: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 8,
    totalPages: 1
  }
};

const initialCoursesState = {
  data: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 8,
    totalPages: 1
  }
};

export const useAdminPortal = () => {
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState(initialUsersState);
  const [selectedUser, setSelectedUser] = useState(null);
  const [courses, setCourses] = useState(initialCoursesState);
  const [announcements, setAnnouncements] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [security, setSecurity] = useState(null);
  const [settings, setSettings] = useState({
    schools: [],
    categories: []
  });
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState({
    dashboard: false,
    users: false,
    userDetail: false,
    courses: false,
    announcements: false,
    analytics: false,
    security: false,
    settings: false,
    action: false
  });
  const [userFilters, setUserFilters] = useState({
    page: 1,
    limit: 8,
    role: 'all',
    status: 'all',
    school: 'all',
    approvalStatus: 'all',
    search: ''
  });
  const [courseFilters, setCourseFilters] = useState({
    page: 1,
    limit: 8,
    status: 'all',
    category: 'all',
    featured: 'all',
    search: ''
  });
  const [announcementFilters, setAnnouncementFilters] = useState({
    status: 'all'
  });

  const setLoadingFlag = (key, value) => {
    setLoading((current) => ({ ...current, [key]: value }));
  };

  const pushNotice = (type, message) => {
    setNotice({ type, message, id: Date.now() });
  };

  const extractErrorMessage = (requestError) => (
    requestError?.response?.data?.message ||
    requestError?.message ||
    'Something went wrong while loading the admin portal.'
  );

  const handleRequest = async (key, callback, successMessage) => {
    setLoadingFlag(key, true);
    setError('');

    try {
      const result = await callback();
      if (successMessage) {
        pushNotice('success', successMessage);
      }
      return result;
    } catch (requestError) {
      const message = extractErrorMessage(requestError);
      setError(message);
      pushNotice('error', message);
      throw requestError;
    } finally {
      setLoadingFlag(key, false);
    }
  };

  const loadDashboard = async () => {
    await handleRequest('dashboard', async () => {
      const response = await adminService.getDashboard();
      setDashboard(response.data);
      return response;
    });
  };

  const loadUsers = async () => {
    await handleRequest('users', async () => {
      const response = await adminService.getUsers(userFilters);
      setUsers(response.data);
      return response;
    });
  };

  const loadUserDetail = async (userId) => {
    await handleRequest('userDetail', async () => {
      const response = await adminService.getUserById(userId);
      setSelectedUser(response.data);
      return response;
    });
  };

  const clearSelectedUser = () => {
    setSelectedUser(null);
  };

  const loadCourses = async () => {
    await handleRequest('courses', async () => {
      const response = await adminService.getCourses(courseFilters);
      setCourses(response.data);
      return response;
    });
  };

  const loadAnnouncements = async () => {
    await handleRequest('announcements', async () => {
      const response = await adminService.getAnnouncements(announcementFilters);
      setAnnouncements(response.data);
      return response;
    });
  };

  const loadAnalytics = async () => {
    await handleRequest('analytics', async () => {
      const response = await adminService.getAnalytics();
      setAnalytics(response.data);
      return response;
    });
  };

  const loadSecurity = async () => {
    await handleRequest('security', async () => {
      const response = await adminService.getSecurity();
      setSecurity(response.data);
      return response;
    });
  };

  const loadSettings = async () => {
    await handleRequest('settings', async () => {
      const [schoolsResponse, categoriesResponse] = await Promise.all([
        adminService.getSchools(),
        adminService.getCategories()
      ]);

      setSettings({
        schools: schoolsResponse.data,
        categories: categoriesResponse.data
      });

      return {
        schoolsResponse,
        categoriesResponse
      };
    });
  };

  const refreshAll = async () => {
    await Promise.all([
      loadDashboard(),
      loadUsers(),
      loadCourses(),
      loadAnnouncements(),
      loadAnalytics(),
      loadSecurity(),
      loadSettings()
    ]);
  };

  const updateUserStatus = async (userId, status) => {
    await handleRequest('action', async () => {
      const response = await adminService.updateUserStatus(userId, { status });
      await Promise.all([loadUsers(), loadDashboard(), loadSecurity()]);
      if (selectedUser?.profile?._id === userId) {
        await loadUserDetail(userId);
      }
      return response;
    }, `User ${status} successfully`);
  };

  const updateUserApproval = async (userId, approvalStatus, note = '') => {
    await handleRequest('action', async () => {
      const response = await adminService.updateUserApproval(userId, { approvalStatus, note });
      await Promise.all([loadUsers(), loadDashboard()]);
      if (selectedUser?.profile?._id === userId) {
        await loadUserDetail(userId);
      }
      return response;
    }, `User ${approvalStatus} successfully`);
  };

  const bulkUserAction = async (userIds, action, note = '') => {
    await handleRequest('action', async () => {
      const response = await adminService.bulkUpdateUsers({ userIds, action, note });
      await Promise.all([loadUsers(), loadDashboard(), loadSecurity()]);
      return response;
    }, `Bulk ${action} completed successfully`);
  };

  const removeUser = async (userId) => {
    await handleRequest('action', async () => {
      const response = await adminService.deleteUser(userId);
      await Promise.all([loadUsers(), loadDashboard(), loadSecurity()]);
      setSelectedUser(null);
      return response;
    }, 'User deleted successfully');
  };

  const moderateCourse = async (courseId, status, reason = '') => {
    await handleRequest('action', async () => {
      const response = await adminService.reviewCourse(courseId, { status, reason });
      await Promise.all([loadCourses(), loadDashboard(), loadAnalytics()]);
      return response;
    }, `Course ${status} successfully`);
  };

  const saveCourse = async (courseId, payload) => {
    await handleRequest('action', async () => {
      const response = await adminService.updateCourse(courseId, payload);
      await Promise.all([loadCourses(), loadDashboard(), loadAnalytics()]);
      return response;
    }, 'Course updated successfully');
  };

  const toggleCourseFeature = async (courseId, isFeatured) => {
    await handleRequest('action', async () => {
      const response = await adminService.toggleFeaturedCourse(courseId, { isFeatured });
      await Promise.all([loadCourses(), loadDashboard()]);
      return response;
    }, isFeatured ? 'Course featured successfully' : 'Course removed from featured list');
  };

  const archiveCourse = async (courseId, archived) => {
    await handleRequest('action', async () => {
      const response = await adminService.archiveCourse(courseId, { archived });
      await Promise.all([loadCourses(), loadDashboard(), loadAnalytics()]);
      return response;
    }, archived ? 'Course archived successfully' : 'Course restored successfully');
  };

  const saveAnnouncement = async (payload, announcementId) => {
    await handleRequest('action', async () => {
      const response = announcementId
        ? await adminService.updateAnnouncement(announcementId, payload)
        : await adminService.createAnnouncement(payload);

      await Promise.all([loadAnnouncements(), loadDashboard()]);
      return response;
    }, announcementId ? 'Announcement updated successfully' : 'Announcement created successfully');
  };

  const removeAnnouncement = async (announcementId) => {
    await handleRequest('action', async () => {
      const response = await adminService.deleteAnnouncement(announcementId);
      await loadAnnouncements();
      return response;
    }, 'Announcement deleted successfully');
  };

  const saveSchool = async (payload, schoolId) => {
    await handleRequest('action', async () => {
      const response = schoolId
        ? await adminService.updateSchool(schoolId, payload)
        : await adminService.createSchool(payload);

      await Promise.all([loadSettings(), loadDashboard()]);
      return response;
    }, schoolId ? 'School updated successfully' : 'School created successfully');
  };

  const removeSchool = async (schoolId) => {
    await handleRequest('action', async () => {
      const response = await adminService.deleteSchool(schoolId);
      await Promise.all([loadSettings(), loadDashboard()]);
      return response;
    }, 'School deleted successfully');
  };

  const saveCategory = async (payload, categoryId) => {
    await handleRequest('action', async () => {
      const response = categoryId
        ? await adminService.updateCategory(categoryId, payload)
        : await adminService.createCategory(payload);

      await Promise.all([loadSettings(), loadDashboard()]);
      return response;
    }, categoryId ? 'Category updated successfully' : 'Category created successfully');
  };

  const removeCategory = async (categoryId) => {
    await handleRequest('action', async () => {
      const response = await adminService.deleteCategory(categoryId);
      await Promise.all([loadSettings(), loadDashboard()]);
      return response;
    }, 'Category deleted successfully');
  };

  useEffect(() => {
    const timer = notice
      ? window.setTimeout(() => setNotice(null), 3500)
      : null;

    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [notice]);

  useEffect(() => {
    void loadDashboard();
    void loadAnalytics();
    void loadSecurity();
    void loadSettings();
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [
    userFilters.page,
    userFilters.limit,
    userFilters.role,
    userFilters.status,
    userFilters.school,
    userFilters.approvalStatus,
    userFilters.search
  ]);

  useEffect(() => {
    void loadCourses();
  }, [
    courseFilters.page,
    courseFilters.limit,
    courseFilters.status,
    courseFilters.category,
    courseFilters.featured,
    courseFilters.search
  ]);

  useEffect(() => {
    void loadAnnouncements();
  }, [announcementFilters.status]);

  return {
    dashboard,
    users,
    selectedUser,
    courses,
    announcements,
    analytics,
    security,
    settings,
    notice,
    error,
    loading,
    userFilters,
    setUserFilters,
    courseFilters,
    setCourseFilters,
    announcementFilters,
    setAnnouncementFilters,
    clearSelectedUser,
    loadUserDetail,
    updateUserStatus,
    updateUserApproval,
    bulkUserAction,
    removeUser,
    moderateCourse,
    saveCourse,
    toggleCourseFeature,
    archiveCourse,
    saveAnnouncement,
    removeAnnouncement,
    saveSchool,
    removeSchool,
    saveCategory,
    removeCategory,
    refreshAll
  };
};

export default useAdminPortal;
