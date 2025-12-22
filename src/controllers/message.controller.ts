import { Request, Response } from "express";
import {
  getMember,
  populateMember,
  populateReactions,
  populateThread,
  populateUser,
} from "../utils/useable_funcs";
import { MessageModel } from "../models/message.model";
import cloudinary from "../config/cloudinary";
import { ObjectId } from "mongoose";
import memberModel from "../models/member.model";

export const createMessage = async (req: Request, res: Response) => {
  const { body, workspaceId, channelId, conversationId, parentMessageId } =
    req.body;
  const imageFile = (req as any).file;

  if (!body) {
    return res.status(400).json({
      success: false,
      message: "Message cannot be empty",
    });
  }

  if (!workspaceId) {
    return res.status(400).json({
      success: false,
      message: "Workspace ID is required",
    });
  }

  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const member = await getMember(workspaceId, userId);
    if (!member) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    console.log(parentMessageId);

    let _conversationId = conversationId;
    if (!conversationId && !channelId && parentMessageId) {
      const parentMessage = await MessageModel.findById(parentMessageId);
      if (!parentMessage) {
        return res.status(404).json({
          success: false,
          message: "Parent message not found",
        });
      }
      _conversationId = parentMessage.conversationId;
    }

    const msgObj: any = {
      body,
      channelId: channelId || null,
      workspaceId,
      memberId: member._id,
      parentMessageId: parentMessageId || null,
      conversationId: _conversationId || null,
      imageUrl: null,
      imagePublicId: null,
    };
    console.log(msgObj);

    // Upload image if provided
    if (imageFile) {
      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: `QuickCollab/messages/${workspaceId}/${channelId}` },
            (err, result) => {
              if (err) return reject(err);
              resolve(result);
            }
          )
          .end(imageFile.buffer);
      });

      msgObj.imageUrl = uploadResult.secure_url;
      msgObj.imagePublicId = uploadResult.public_id;
    }

    const savedMessage = await MessageModel.create(msgObj);

    const populatedMember = await populateMember(savedMessage.memberId);
    if (!populatedMember) {
      return res.status(500).json({
        success: false,
        message: "Failed to populate member",
      });
    }

    const populatedUser = await populateUser(populatedMember.userId);
    if (!populatedUser) {
      return res.status(500).json({
        success: false,
        message: "Failed to populate user",
      });
    }

    const reactions = await populateReactions(savedMessage._id as ObjectId);

    const reactionsMerged = reactions.reduce((acc: any[], r: any) => {
      const exists = acc.find((x) => x.value === r.value);
      if (exists) {
        exists.count++;
        exists.memberIds.push(r.memberId);
      } else {
        acc.push({ value: r.value, count: 1, memberIds: [r.memberId] });
      }
      return acc;
    }, []);

    const thread = await populateThread(savedMessage._id as ObjectId);

    const formattedMessage = {
      channelId,
      id: savedMessage._id,
      workspaceId: savedMessage.workspaceId,
      body: savedMessage.body,
      imageUrl: savedMessage.imageUrl,
      parentMessageId: savedMessage.parentMessageId,
      conversationId: savedMessage.conversationId,
      member: {
        id: populatedMember._id,
        role: populatedMember.role,
      },

      user: {
        id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
      },

      reactions: reactionsMerged,
      threadCount: thread.count,
      threadImage: thread.image || null,
      threadTimestamp: thread.timestamp,

      createdAt: savedMessage.createdAt,
      updatedAt:
        savedMessage.updatedAt > savedMessage.createdAt
          ? savedMessage.updatedAt
          : null,
    };

    return res.status(201).json({
      success: true,
      message: "Message sent",
      data: formattedMessage,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  const { channelId, conversationId, parentMessageId } = req.body;
  const { page = 1, limit = 20 } = req.body.paginationOpts || {};

  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const conditions: any = {};

    // THREAD messages
    if (parentMessageId) {
      conditions.parentMessageId = parentMessageId;
    }

    // CONVERSATION messages
    else if (conversationId) {
      conditions.conversationId = conversationId;
      conditions.parentMessageId = null;
    }

    // CHANNEL messages 
    else if (channelId) {
      conditions.channelId = channelId;
      conditions.parentMessageId = null; 
    }

    if (!channelId && !conversationId && !parentMessageId) {
      return res.status(400).json({
        success: false,
        message: "Must provide channelId OR conversationId OR parentMessageId",
      });
    }

    const skip = (Number(page) - 1) * Number(limit);

    const rawMessages = await MessageModel.find(conditions)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await MessageModel.countDocuments(conditions);

    const messages = await Promise.all(
      rawMessages.map(async (message) => {
        const member = await populateMember(message.memberId);
        if (!member) return null;

        const user = await populateUser(member.userId);
        if (!user) return null;

        const reactions = await populateReactions(message._id as ObjectId);
        const reactionsMerged = reactions.reduce((acc: any[], r: any) => {
          const exists = acc.find((x) => x.value === r.value);
          if (exists) {
            exists.count++;
            exists.memberIds.push(r.memberId);
          } else {
            acc.push({ value: r.value, count: 1, memberIds: [r.memberId] });
          }
          return acc;
        }, []);

        const thread = await populateThread(message._id as ObjectId);

        return {
          channelId,
          id: message._id,
          workspaceId: message.workspaceId,

          body: message.body,
          imageUrl: message.imageUrl,

          member: {
            id: member._id,
            role: member.role,
          },

          user: {
            id: user._id,
            name: user.name,
            email: user.email,
          },

          reactions: reactionsMerged,

          threadCount: thread.count,
          threadImage: thread.image || null,
          threadTimestamp: thread.timestamp,

          createdAt: message.createdAt,
          updatedAt:
            message.updatedAt > message.createdAt ? message.updatedAt : null,
        };
      })
    );

    const cleaned = messages.filter((m) => m !== null);

    return res.status(200).json({
      success: true,
      data: cleaned,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const updateMessage = async (req: Request, res: Response) => {
  const { id, body } = req.body;
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const message = await MessageModel.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    const member = await getMember(message?.workspaceId, userId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!member || member.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    message.body = body;
    message.updatedAt = new Date(Date.now());
    message.save();

    res.status(201).json({
      success: true,
      message: "Message Updated",
      Message: message,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const removeMessage = async (req: Request, res: Response) => {
  const { id } = req.body;
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const message = await MessageModel.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    const member = await getMember(message.workspaceId, userId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (member.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (message.imagePublicId) {
      await cloudinary.uploader.destroy(message.imagePublicId);
      console.log("Cloudinary image deleted:", message.imagePublicId);
    }

    await message.deleteOne();

    res.status(201).json({
      success: true,
      message: "Message deleted",
      Message: message,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getMessage = async (req: Request, res: Response) => {
  const { id } = req.body;

  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const message = await MessageModel.findById(id);
    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }
    const currentMember = await getMember(message.workspaceId, userId);
    if (!currentMember) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const member = await populateMember(message.memberId);
    if (!member) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await populateUser(member.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const reactions = await populateReactions(message._id as ObjectId);

    const reactionsMerged = reactions.reduce((acc: any[], r: any) => {
      const existing = acc.find((x) => x.value === r.value);
      if (existing) {
        existing.count++;
        existing.memberIds.push(r.memberId);
      } else {
        acc.push({
          value: r.value,
          count: 1,
          memberIds: [r.memberId],
        });
      }
      return acc;
    }, []);

    const thread = await populateThread(message._id as ObjectId);

    const formatted = {
      channelId: message.channelId,
      id: message._id,
      workspaceId: message.workspaceId,

      body: message.body,
      imageUrl: message.imageUrl,

      member: {
        id: member._id,
        role: member.role,
      },

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },

      reactions: reactionsMerged,

      threadCount: thread.count,
      threadImage: thread.image || null,
      threadTimestamp: thread.timestamp,

      createdAt: message.createdAt,
      updatedAt:
        message.updatedAt > message.createdAt ? message.updatedAt : null,
    };

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
