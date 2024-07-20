import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  console.log(videoId);
  // Convert page and limit to integers
  const pageInt = parseInt(page, 10);
  const limitInt = parseInt(limit, 10);

  try {
    // Create an aggregation pipeline
    const commentsAggregation = Comment.aggregate([
      {
        $match: { video: mongoose.Types.ObjectId(videoId) },
      },
      { $sort: { createdAt: -1 } }, // Sort by creation date descending
    ]);

    // Apply pagination to the aggregation
    const options = {
      page: pageInt,
      limit: limitInt,
    };

    const comments = await Comment.aggregatePaginate(
      commentsAggregation,
      options
    );

    return res
      .status(200)
      .json(new ApiResponse(200, "Get video comments successfully", comments));
  } catch (error) {
    return new ApiError(500, "error while getting comments");
  }
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video

  const { videoId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  if (!content) {
    return new ApiError(400, "content is required ");
  }

  try {
    // Create and save the new comment

    const newComment = await Comment.create({
      content,
      video: videoId,
      owner: userId,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, newComment, "Comment added succesffuly "));
  } catch (error) {
    throw new ApiError(500, "Error while adding comment");
  }
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment

  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user._id; // due to  auth middleware

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  try {
    // find th comment by Id and ensure it belong to the user
    const comment = await Comment.findOne({ _id: commentId, owner: userId });

    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }

    // update
    comment.content = content;

    // Save
    const updatedComment = await comment.save();

    return res
      .status(200)
      .json(200, updatedComment, "Comment updated Succesfully ");
  } catch (error) {
    throw new ApiError(500, "Error updation comment");
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment

  const { commentId } = req.params;
  const userId = req.user._id;

  try {
    // find

    const comment = await Comment.findOne({ _id: commentId, owner: userId });

    if (!comment) {
      throw new ApiError(404, "Comment not found or not authorized ");
    }

    // delete
    await comment.remove();

    return res
      .status(200)
      .json(new ApiResponse(200, "Comment deleted Succesfully"));
  } catch (error) {
    throw new ApiError(500, "Error deleting comment");
  }
});

export { getVideoComments, addComment, updateComment, deleteComment };
