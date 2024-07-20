import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  try {
      // Use the authecnticated uer's Id as the channel Id
      const channelId = req.user._id;

      // get Total video views
      const totalViews = await Video.aggregate([
        {
            $match:{
                owner:mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group:{
                _id:null, 
                totalViews:{
                    $sum:"$views"
                }
            }
        }
      ]);

      // Get total subscribers 
      const totalSubscribers = await Subscription.countDocuments({
          channel:channelId
      });

      // get total Videos
      const totalVideos = await Video.countDocuments({
        owner:channelId
      });

      // Get total likes for the channel's videos
      const totallikes = await Like.aggregate([
        {
            $match:{
                video:{
                    $in:await Video.find({
                        owner:channelId
                    }).distinct('_id')
                }
            }
        },
        {
            $group:{
                _id:null, 
                totallikes:{
                    $sum:1
                }
            }
        }
      ])


      return res.status(200).json(
        new ApiResponse(200 ,{totalViews:totalViews[0]?.totalViews || 0 ,totalSubscribers, totalVideos,totallikes:totallikes[0]?.totallikes || 0 } )
      )


  } catch (error) {
    throw new ApiError(500, "Error while fetching channel stats");
  }
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel

  const channelId = req.user._id;

  // Get all video uploaded by the channel 
  const videos = await Video.find({
    owner:channelId
  })

  return res.status(200).json(new ApiResponse(200,videos, "Get channel Videoes succesfully "));

});

export { getChannelStats, getChannelVideos };
