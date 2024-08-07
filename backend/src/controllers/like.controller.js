import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  // const { videoId } = req.params;
  // //TODO: toggle like on video
  // const userId = req.user._id;

  // // check if the video exists
  // const video = await Video.findById(videoId);
  // if (!video) {
  //   throw new ApiError(404, "Video not found");
  // }
  

  // // Check if the user has already liked the video
  // const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

  // if (existingLike) {
  //   // if like exists, remove it (unlike)
  //   await existingLike.remove();

  //   return res.status(200).json(new ApiResponse(200, "Like removed"));
  // } else {
  //   // If like does not exits, add it (like)
  //   const like = new Like({ video: videoId, likedBy: userId });
  //   await like.save();

  //   return res.status(201).json(new ApiResponse(201, "Like added"));
  // }

  // update and fix issue 
  const { videoId } = req.params;
  const userId = req.user._id;

  // Check if the video exists
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Check if the user has already liked the video
  const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

  if (existingLike) {
    // If like exists, remove it (unlike)
    await Like.deleteOne({ _id: existingLike._id }); // Use deleteOne instead

    return res.status(200).json(new ApiResponse(200, "Like removed"));
  } else {
    // If like does not exist, add it (like)
    const like = new Like({ video: videoId, likedBy: userId });
    await like.save();

    return res.status(201).json(new ApiResponse(201, "Like added"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment

  const userId = req.user._id;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "comment not found");
  }

  // check if the user has already liked the comment
  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });

  if (existingLike) {
    await existingLike.remove();
    return res.status(200).json(new ApiResponse(200, "Like removed"));
  } else {
    const like = new Like({
      comment: commentId,
      likedBy: userId,
    });
    await like.save();
    return res.status(201).json(new ApiResponse(201, "Like added"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  const userId = req.user._id;

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  const existingLike = await Like.findOne({ tweet: tweetId, likedBy: userId });

  if (existingLike) {
    await existingLike.remove();
    return new ApiError(200, "like removed");
  } else {
    const like = new Like({
      tweet: tweetId,
      likedBy: userId,
    });
    await like.save();
    return res.status(201).json(new ApiResponse(201, "Like added"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const userId = req.user._id;
  // find all likes by the user that are associcated with videos
  const likes = await Like.find({
    likedBy: userId,
    video: { $exists: true },
  }).populate("video");

  // Extract videos from the likes
  const likedVideos = likes.map((like) => like.video);

  return res
    .status(200)
    .json(new ApiResponse(200, likedVideos, "Liked videos get Successfully "));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };


