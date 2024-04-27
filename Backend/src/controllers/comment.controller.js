import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const comments = await Comment.paginate(
      { video: videoId },
      { page: parseInt(page), limit: parseInt(limit) }
    );

    res.json(new ApiResponse(200, comments));
  } catch (error) {
    next(new ApiError(500, error.message));
  }
});

const addComment = asyncHandler(async (req, res, next) => {
  try {
    const { content } = req.body;
    const { videoId } = req.params;
    const { userId } = req.user; // Assuming you have user ID in req.user

    const comment = new Comment({
      content,
      video: videoId,
      owner: userId,
    });

    await comment.save();

    res.json(new ApiResponse(201, comment));
  } catch (error) {
    next(new ApiError(500, error.message));
  }
});

const updateComment = asyncHandler(async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return next(new ApiError(404, "Comment not found"));
    }

    comment.content = content;
    await comment.save();

    res.json(new ApiResponse(200, comment));
  } catch (error) {
    next(new ApiError(500, error.message));
  }
});

const deleteComment = asyncHandler(async (req, res, next) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return next(new ApiError(404, "Comment not found"));
    }

    await comment.remove();

    res.json(new ApiResponse(200, "Comment deleted successfully"));
  } catch (error) {
    next(new ApiError(500, error.message));
  }
});

export { getVideoComments, addComment, updateComment, deleteComment };
