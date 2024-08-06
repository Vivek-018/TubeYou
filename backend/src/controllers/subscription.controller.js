import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  // const { channelId } = req.params;
  // // TODO: toggle subscription

  // const userId = req.user._id;

  // const IsvalidChananlId = isValidObjectId(channelId);

  // if (IsvalidChananlId === "false") {
  //   throw new ApiError(400, "Invalid channel Id");
  // }

  // const channel = await User.findById(channelId);

  // if (!channel) {
  //   throw new ApiError(404, "Channel not found");
  // }

  // const subscription = await Subscription.findOne({
  //   subscriber: userId,
  //   channel: channelId,
  // });

  // if (subscription) {
  //   // Unsubscribe
  //   await subscription.remove();
  //   return res
  //     .status(200)
  //     .json(new ApiResponse(200, {}, "Unsubcribed successfully "));
  // } else {
  //   //Subscribe
  //   await Subscription.create({
  //     subscriber: userId,
  //     channel: channelId,
  //   });

  //   return res
  //     .status(201)
  //     .json(new ApiResponse(201, {}, "Subscribed successfully "));
  // }

  // update code and test
  const { channelId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
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
    await Subscription.deleteOne({ _id: subscription._id });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Unsubscribed successfully"));
  } else {
    // Subscribe
    await Subscription.create({
      subscriber: userId,
      channel: channelId,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, {}, "Subscribed successfully"));
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid ID");
  }

  const channel = await User.findById(subscriberId);

  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  const subscription = await Subscription.find({
    channel: subscriberId,
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

  // update code to test
  const { channelId } = req.params;

  // console.log(`Received subscriberId: ${channelId}`);

  // Validate subscriberId
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid subscriber ID");
  }

  // Check if subscriber exists
  const subscriber = await User.findById(channelId);
  if (!subscriber) {
    throw new ApiError(404, "Subscriber not found");
  }

  // Find subscriptions and populate channel info
  const subscriptions = await Subscription.find({
    subscriber: channelId,
  }).populate("channel", "username email avatar");

  // Extract channel info from subscriptions
  const channels = subscriptions.map((sub) => sub.channel);

  return res.status(200).json(
    new ApiResponse(200, "Subscribed channels retrieved successfully", {
      channels,
    })
  );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
