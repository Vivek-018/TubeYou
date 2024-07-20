import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription

  const userId = req.user._id;

  const IsvalidChananlId = isValidObjectId(channelId);

  if (IsvalidChananlId === "false") {
    throw new ApiError(400, "Invalid channel Id");
  }

  const channel = await User.findById(channelId);

  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  const subscription = await Subscription.findOne({
    subscriber: userId,
    channel: channelId,
  });

  if (subscription) {
    // Unsubscribe
    await subscription.remove();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Unsubcribed successfully "));
  } else {
    //Subscribe
    await Subscription.create({
      subscriber: userId,
      channel: channelId,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, {}, "Subscribed successfully "));
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const channel = await User.findById(channelId);

  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  const subscription = await Subscription.find({
    channel: channelId,
  }).populate("subscriber", "username email avatar");

  const subscribers = subscription.map((sub) => sub.subscriber);

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Subscribers retrived successfully", { subscribers })
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber ID");
  }

  const subscriber = await User.findById(subscriberId);

  if (!subscriber) {
    throw new ApiError(404, "subscriber not found");
  }

  const subscription = await Subscription.find({
    subscriber: subscriberId,
  }).populate("channel", "username email avatar");

  const channels = Subscription.map((sub) => sub.channel);

  return req
    .status(200)
    .json(
      new ApiResponse(200, "subscribed channels retrieved successfully", {
        channels,
      })
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
