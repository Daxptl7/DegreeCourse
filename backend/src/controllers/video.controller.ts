
import Video from '../models/Video.js';
import { sendSuccess, sendError } from '../utils/response.js';

// @desc    Create a new video
// @route   POST /api/videos
// @access  Private (Teacher)
export const createVideo = async (req, res) => {
  try {
    const { title, category, description, duration, videoUrl, thumbnail } = req.body;

    const video = await Video.create({
      title,
      category,
      description,
      duration,
      videoUrl,
      thumbnail,
      user: req.user._id
    });

    sendSuccess(res, 201, video, 'Video uploaded successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Get all videos for current teacher
// @route   GET /api/videos
// @access  Private (Teacher)
export const getVideos = async (req, res) => {
  try {
    const videos = await Video.find({ user: req.user._id }).sort({ createdAt: -1 });
    sendSuccess(res, 200, videos, 'Videos retrieved automatically');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// @desc    Delete a video
// @route   DELETE /api/videos/:id
// @access  Private (Teacher)
export const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
        return sendError(res, 404, 'Video not found');
    }

    // Ensure user owns the video
    if (video.user.toString() !== req.user._id.toString()) {
        return sendError(res, 401, 'Not authorized');
    }

    await video.deleteOne();
    sendSuccess(res, 200, {}, 'Video deleted successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
