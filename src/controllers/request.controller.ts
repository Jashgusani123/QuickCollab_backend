import { Request as APIRequest, Response } from "express";
import { Friend } from "../models/friend.model";
import { Request, RequestStatus, RequestType } from "../models/request.model";

export const sentRequest = async (req: APIRequest, res: Response) => {
  try {
    const { oppUserId } = req.body;
    const userId = (req as any).user.id;

    if (!userId || !oppUserId) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    const isAlreadyFriend = await Friend.findOne({
      ownerId : userId,
      friendIds: { $in: [oppUserId] },
    })

    if(isAlreadyFriend){
      const sentRequests = isAlreadyFriend.friendIds.filter(friendId => friendId.toString() === oppUserId);
      return res.status(200).json({ success: true, message: "Already friends", sentRequests: sentRequests ?? [] });
    }

    const isRequestedToFriend = await Request.findOne({
      senderId: userId,
      requestedId: { $in: [oppUserId] },
      status: RequestStatus.PENDING,
      type: RequestType.FRIEND_REQUEST,
    });

    if (isRequestedToFriend) {
      return res.status(409).json({ success: false, message: "Friend request already sent" });
    }

    const newRequest = new Request({
      senderId: userId,
      requestedId: [oppUserId],
      status: "PENDING",
      type: "FRIEND_REQUEST",
    });

    await newRequest.save();

    return res.status(200).json({ success: true, message: "Friend request sent successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const acceptRequest = async (req: APIRequest, res: Response) => {
  try {
    const { oppUserId } = req.body;
    const userId = (req as any).user.id;

    if (!userId || !oppUserId) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    // FIXED: oppUserId is the original sender, userId (current user) is the recipient
    const isRequestedToFriend = await Request.findOne({
      senderId: oppUserId,
      requestedId: { $in: [userId] },
      status: RequestStatus.PENDING,
      type: RequestType.FRIEND_REQUEST,
    });

    if (!isRequestedToFriend) {
      return res.status(400).json({ success: false, message: "No friend request found" });
    }

    isRequestedToFriend.status = RequestStatus.ACCEPTED;
    await isRequestedToFriend.save();

    // Add oppUserId to current user's friend list
    const isFriendExists = await Friend.findOne({
      ownerId: userId,
      friendIds: { $in: [oppUserId] },
    });

    if (!isFriendExists) {
      await new Friend({ ownerId: userId, friendIds: [oppUserId] }).save();
    }

    // Mirror: also add current user to the sender's friend list (friendship is mutual)
    const isReverseFriendExists = await Friend.findOne({
      ownerId: oppUserId,
      friendIds: { $in: [userId] },
    });

    if (!isReverseFriendExists) {
      await new Friend({ ownerId: oppUserId, friendIds: [userId] }).save();
    }

    await isRequestedToFriend.deleteOne();

    return res.status(200).json({ success: true, message: "Friend request accepted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const declineRequest = async (req: APIRequest, res: Response) => {
  try {
    const { oppUserId } = req.body;
    const userId = (req as any).user.id;

    if (!userId || !oppUserId) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    const isRequestedToFriend = await Request.findOne({
      senderId: oppUserId,
      requestedId: { $in: [userId] },
      status: RequestStatus.PENDING,
      type: RequestType.FRIEND_REQUEST,
    });

    if (!isRequestedToFriend) {
      return res.status(400).json({ success: false, message: "No friend request found" });
    }

    await isRequestedToFriend.deleteOne();

    return res.status(200).json({ success: true, message: "Friend request declined" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getAllrequests = async (req: APIRequest, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const findSentRequests = await Request.find({ senderId: userId })
      .sort({ createdAt: -1 })
      .select("requestedId");
    const sentRequests = findSentRequests.map((request) => request.requestedId).flat();

    
    const findIncomingRequests = await Request.find({
      requestedId: { $in: [userId] },
      status: RequestStatus.PENDING,
      type: RequestType.FRIEND_REQUEST,
    })
      .sort({ createdAt: -1 })
      .populate("senderId", "name image"); // adjust field names to match your User model

    const incomingRequests = findIncomingRequests.map((request: any) => ({
      oppUserId: request.senderId._id,
      name: request.senderId.name,
      image: request.senderId.image,
      createdAt: request.createdAt,
      status: "pending",
    }));

    const Friends = await Friend.findOne({
      ownerId : userId,
    })
    let friends:any = [];
    if(Friends){
      friends = Friends.friendIds;
    }

    return res.status(200).json({
      success: true,
      message: "Requests fetched successfully",
      sentRequests: sentRequests ?? [],
      incomingRequests: incomingRequests ?? [],
      friends: friends ?? [],
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};