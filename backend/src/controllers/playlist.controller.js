import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  // console.log("name:", name);
  // console.log("description:", description);
  const userId = req.user._id;
  //TODO: create playlist
  // validate input
  if (!name || !description) {
    throw new ApiError(400, "name and description are required");
  }

  // Create a new playlist
  const playlist = await Playlist.create({
    name,
    description,
    owner: userId,
    videos: [],
  });

  // Save the new playlist to the database

  await playlist.save();

  // Return a success response
  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "playlist creted successfully"));
});

 
const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists

  // validate the userid
  if (!userId) {
    throw new ApiError(400, "user Id is required");
  }

  // check if the userId is valid objectId
  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid User Id");
  }

  // find all playlist

  const playlists = await Playlist.find({ owner: userId });

  // check if any playlist are found
  if (!playlists.length) {
    return res
      .status(404)
      .json(new ApiResponse(404, [], "no playlists found for this user"));
  } else {
    return res
      .status(200)
      .json(new ApiResponse(200, playlists, "Get User playlist Successfully"));
  }
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!playlistId) {
    throw new ApiError(400, "playlist Id is required");
  }

  // Check if the playlistId is a valid id
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid Playlist Id");
  }

  // Find the playlis by id
  const playlist = await Playlist.findById(playlistId).populate("videos");

  // check if the playlist is found
  if (!playlist) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Playlist not found "));
  } else {
    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "Get playlist successfully"));
  }
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  // Validate the playlistId and videoId
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid Playlist ID");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  // Find the playlist by id
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    res.status(404);
    throw new ApiError(404, "Playlist not found");
  }

  // Check if the video exists
  const video = await Video.findById(videoId);
  if (!video) {
    res.status(404);
    throw new ApiError(404, "Video not found");
  }

  // Check if the video already exists in the playlist
  if (playlist.videos.includes(videoId)) {
    res.status(400);
    throw new ApiError(400, "Video already exists in the playlist");
  }

  // Add the video to the playlist
  playlist.videos.push(videoId);

  // Save the updated playlist
  await playlist.save();

  // Return a success response
  return res
    .status(200)
    .json(new ApiResponse( 200 , playlist, "Video added to playlist successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist

  // validate the playlistId and vidoeId
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid Plalylist Id");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid video id ");
  }

  // find th playlist by id
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "playlist not foudn");
  }

  // check if the video exits in the playlist

  const videoIndex = playlist.videos.indexOf(videoId);
  if (videoIndex === -1) {
    throw new ApiError(404, "video not foudn in the playlist");
  }

  // Remove the video from the playlist
  playlist.videos.splice(videoIndex, 1);

  // save the updated playlist
  await playlist.save();

  return res
    .status(200)
    .json(
      200,
      new ApiResponse(200, playlist, "Video removed from playlist successfully")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  // const { playlistId } = req.params;
  // // TODO: delete playlist

  // // Validate the playlistId
  // if (!isValidObjectId(playlistId)) {
  //   throw new ApiError(400, "Invalid Playlist ID");
  // }

  // // Find the playlist by id
  // const playlist = await Playlist.findById(playlistId);
  // if (!playlist) {
  //   res.status(404);
  //   throw new ApiError(404, "Playlist not found");
  // }

  // // Delete the playlist
  // await playlist.remove();

  // // Return a success response
  // return res
  //   .status(200)
  //   .json(new ApiResponse(null, "Playlist deleted successfully"));

  // update and fix issue
const { playlistId } = req.params;

  // Validate the playlistId
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid Playlist ID");
  }

  // Find the playlist by id
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    res.status(404);
    throw new ApiError(404, "Playlist not found");
  }

  // Delete the playlist
  await playlist.deleteOne();

  // Return a success response
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully"));

});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  console.log(name);
  console.log(description);
  //TODO: update playlist

  // Validate the playlistId
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid Playlist ID");
  }

  // Find the playlist by id
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    res.status(404);
    throw new ApiError(404, "Playlist not found");
  }

  // Update the playlist fields
  if (name) playlist.name = name;
  if (description) playlist.description = description;

  // Save the updated playlist
  await playlist.save();

  // Return a success response
  return res
    .status(200)
    .json(new ApiResponse(playlist, "Playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
