import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

// const getAllVideos = asyncHandler(async (req, res) => {
//   const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
//   //TODO: get all videos based on query, sort, pagination
//   const videos = await Video.find();

//   // console.log(req.user._id);
//   // console.log(req.query);
//   // console.log(query);
//   // console.log(sortBy);
//   // console.log(userId);

//   return res
//     .status(200)
//     .json(new ApiResponse(200, videos, "get all videos successfullly "));
// });

// Testing code
const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  // Convert page and limit to integers
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  // Validate page and limit
  if (isNaN(pageNum) || isNaN(limitNum) || pageNum <= 0 || limitNum <= 0) {
    throw new ApiError(400, "Invalid pagination parameters");
  }

  // Build the aggregation pipeline
  const pipeline = [];

  // Match based on search query
  if (query) {
    pipeline.push({
      $match: {
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      },
    });
  }

  // Match based on userId
  if (userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "Invalid user ID");
    }
    pipeline.push({
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    });
  }

  // Sort
  const sortOptions = {};
  sortOptions[sortBy] = sortType === "asc" ? 1 : -1;
  pipeline.push({ $sort: sortOptions });

  // Pagination
  pipeline.push(
    {
      $skip: (pageNum - 1) * limitNum,
    },
    {
      $limit: limitNum,
    }
  );

  // Execute the aggregate paginate
  try {
    const aggregateQuery = Video.aggregate(pipeline);
    const options = {
      page: pageNum,
      limit: limitNum,
    };

    const videos = await Video.aggregatePaginate(aggregateQuery, options);

    return res
      .status(200)
      .json(new ApiResponse(200, videos, "Videos retrieved successfully"));
  } catch (error) {
    console.error("Error fetching videos:", error);
    throw new ApiError(500, "Server error");
  }
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  console.log(title);
  console.log(description);

  // TODO: get video, upload to cloudinary, create video
  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  console.log(req.files);

  const videoLocalpath = req.files?.videoFile[0].path;
  const thumbnailLocalpath = req.files?.thumbnail[0].path;

  if (!videoLocalpath) {
    throw new ApiError(400, "video file is required ");
  }
  if (!thumbnailLocalpath) {
    throw new ApiError(400, "Thumbnail file is required ");
  }

  console.log("no error ");
  const videofile = await uploadOnCloudinary(videoLocalpath);
  const thumbnailfile = await uploadOnCloudinary(thumbnailLocalpath);

  console.log(videofile);

  const PublishVideo = await Video.create({
    videoFile: videofile.url,
    thumbnail: thumbnailfile.url,
    title: title,
    description: description,
    duration: videofile.duration,
    owner: req.user._id,
    isPublished: true,
  });

  if (!PublishVideo) {
    throw new ApiError(400, "Error while storing in db ");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, PublishVideo, "Video is Published successfully")
    );
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!videoId) {
    throw new ApiError(400, "videoid is required ");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found ");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video is founded successfully "));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  const { title, description } = req.body;
  console.log(title);
  console.log(description);
  console.log(req.file.path);

  const thumbnailLocalpath = req.file?.path;

  const thumbnailfile = await uploadOnCloudinary(thumbnailLocalpath);

  const updatedvideo = await Video.findByIdAndUpdate(
    videoId,
    {
      title: title,
      description: description,
      thumbnail: thumbnailfile.url,
    },
    { new: true }
  );

  if (!updateVideo) {
    throw new ApiError(401, "Error while updation the video details ");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedvideo, "Video details updated Successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  const deletedvideo = await Video.findByIdAndDelete(videoId);

  if (!deletedvideo) {
    throw new ApiError(404, "Video not found and not deleted  ");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video is deleted Successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  video.isPublished = !video.isPublished;
  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Status updated Successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
