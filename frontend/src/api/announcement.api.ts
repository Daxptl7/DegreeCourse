import api from './axios';

// Create a new announcement (Teacher)
export const createAnnouncement = async (courseId, title, content) => {
    try {
        const response = await api.post(
            '/announcements/create',
            { courseId, title, content }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get all announcements for a course
export const getAnnouncements = async (courseId) => {
    try {
        const response = await api.get(
            `/announcements/${courseId}`
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Mark an announcement as read
export const markAsRead = async (announcementId) => {
    try {
        const response = await api.put(
            `/announcements/${announcementId}/read`,
            {}
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get unread counts for a list of courses
export const getUnreadCounts = async (courseIds) => {
    try {
        const response = await api.post(
            '/announcements/unread-counts',
            { courseIds }
        );
        return response.data;
    } catch (error) {
        // Return empty object on error to not break UI
        console.error("Failed to fetch unread counts", error);
        return { success: true, data: {} };
    }
};

// Update an announcement (Teacher)
export const updateAnnouncement = async (announcementId, title, content) => {
    try {
        const response = await api.put(
            `/announcements/${announcementId}`,
            { title, content }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Delete an announcement (Teacher)
export const deleteAnnouncement = async (announcementId) => {
    try {
        const response = await api.delete(
            `/announcements/${announcementId}`
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

