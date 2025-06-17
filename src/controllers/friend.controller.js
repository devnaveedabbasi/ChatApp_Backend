import mongoose from "mongoose";
import { User } from "../models/auth.model.js";
import { FriendModel } from "../models/friendRequest.modal.js";
import { ApiError } from "../utlis/apiError.js";
import { ApiResponse } from "../utlis/apiResponse.js";
import asyncHandler from "../utlis/asyncHandler.js";

export const sendFriendRequest = asyncHandler (async (req, res, next) =>  {

    const { receiverId } = req.body;
    const senderId = req.user._id;

    // Prevent sending request to self
    if (senderId.toString() === receiverId.toString()) {
      return next(new ApiError(400, "You can't send a request to yourself"));
    }

    const existing = await FriendModel.findOne({
      sender: senderId,
      receiver: receiverId,
    });

    if (existing) {
              return next(new ApiError(400, "Friend request already sent"));    }

    // Create new friend request
    const newRequest = await FriendModel.create({
      sender: senderId,
      receiver: receiverId,
    });

    return res
      .status(201)
      .json(new ApiResponse(200, "Friend request sent successfully", newRequest));
  
});

export const cancelFriendRequest = asyncHandler(async (req, res, next) => {
  const { receiverId } = req.body;
  const senderId = req.user._id;

  if (!receiverId) {
    return next(new ApiError(400, "receiverId is required"));
  }

  const deletedRequest = await FriendModel.findOneAndDelete({
    sender: senderId,
    receiver: receiverId,
    status: "pending",
  });

  if (!deletedRequest) {
    return next(new ApiError(404, "No pending friend request found to cancel"));
  }

  return res.status(200).json(
    new ApiResponse(200, "Friend request canceled successfully", deletedRequest)
  );
});


export const acceptFriendRequest = asyncHandler( async (req, res)=> {

    const { requestId } = req.body;

    if (!requestId) {
      throw new ApiError(400, "Request ID is required");
    }

    const request = await FriendModel.findById(requestId);
    if (!request) throw new ApiError(404, "Friend request not found");

    if(request.status=='accepted'){
        throw new ApiError(402,'Already Friend Accepted')
    }
    request.status = "accepted";
    await request.save();

   await User.findByIdAndUpdate(request.sender, {
  $addToSet: { friends: request.receiver },
});

await User.findByIdAndUpdate(request.receiver, {
  $addToSet: { friends: request.sender },
});


    const response = new ApiResponse(200, request, "Friend request accepted");
    res.status(200).json(response);
 
});



export const rejectedFriendRequest = asyncHandler( async (req, res)=> {

    const { requestId } = req.body;

    if (!requestId) {
      throw new ApiError(400, "Request ID is required");
    }

    const request = await FriendModel.findById(requestId);
    if (!request) throw new ApiError(404, "Friend request not found");

    request.status = "rejected";
    await request.save();

   await User.findByIdAndUpdate(request.sender, {
  $addToSet: { friends: request.receiver },
});

await User.findByIdAndUpdate(request.receiver, {
  $addToSet: { friends: request.sender },
});


    const response = new ApiResponse(200, request, "Friend request rejected");
    res.status(200).json(response);
 
});


export const getFriendRequests = asyncHandler(async (req, res) =>  {
    const userId = req.user._id;

    const requests = await FriendModel.find({
      receiver: userId,
      status: "pending",
    }).populate("sender", "fullName email profilePic");

    res.status(200).json(new ApiResponse(200,requests,'All friend Requested'));
})

export const getSentFriendRequests = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const requests = await FriendModel.find({
    sender: userId,
    status: "pending",
  }).populate("receiver", "fullName email profilePic");

  res.status(200).json(new ApiResponse(200, requests, 'All sent friend requests'));
});


export const unfriend = asyncHandler(async (req, res) => {
  const { friendId } = req.body;
  const userId = req.user._id;

  if (!friendId) {
    throw new ApiError(404, 'friendId is required');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(400, "User not found");
  }

  const isFriendExist = user.friends.includes(friendId);
  if (!isFriendExist) {
    throw new ApiError(402, 'Friend is already deleted');
  }

  user.friends = user.friends.filter(id => id.toString() !== friendId);
  await user.save();

  const friendUser = await User.findById(friendId);
  if (friendUser) {
    friendUser.friends = friendUser.friends.filter(id => id.toString() !== userId.toString());
    await friendUser.save();
  }

  const deletedRequest = await FriendModel.findOneAndDelete({
    status: "accepted",
    $or: [
      { sender: userId, receiver: friendId },
      { sender: friendId, receiver: userId }
    ]
  });

  if (!deletedRequest) {
    console.log("No friend request found to delete");
  } else {
    console.log("Friend request deleted:", deletedRequest);
  }

  return res.status(200).json(new ApiResponse(200, "Unfriend successfully"));
});



export const getAllFriends = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).populate(
    "friends",
    "fullName email profilePic"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, user.friends, "Friends fetched successfully")
  );
});

export const getSuggestedFriends = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).populate("friends");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const friendRequests = await FriendModel.find({
    $or: [
      { sender: userId },
      { receiver: userId }
    ]
  });

  const excludedUserIds = new Set();

  user.friends.forEach(friend => excludedUserIds.add(friend._id.toString()));

  friendRequests.forEach(req => {
    excludedUserIds.add(req.sender.toString());
    excludedUserIds.add(req.receiver.toString());
  });

  // Also exclude self
  excludedUserIds.add(userId.toString());

  // Step 4: Find all users excluding these
  const suggestedFriends = await User.find({
    _id: { $nin: Array.from(excludedUserIds) }
  });

  return res.status(200).json(
    new ApiResponse(200, suggestedFriends, "Suggested friends fetched successfully")
  );
});
