import { Request, Response } from "express";
import Member from "../models/member.model";
import Channel from "../models/channel.model";
import { toNamespacedPath } from "node:path";


export const getChannels = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const userId = (req as any).user.id;

    if (!userId || !workspaceId) {
      res.status(404).json({ success: false, message: "Unauthorized", channels: [] })
    }
    const membership = await Member.findOne({
      userId,
      workspaceId,
    });

    if (!membership) {
      return res.status(404).json({ success: false, message: "Unauthorized", channels: [] })
    }

    const channel = await Channel.find({ workspaceId });

    res.status(200).json({ success: true, channels: channel })
  } catch (error) {
    console.log(error);
    return res.status(404).json({ success: false, message: "Internal Server Error" })
  }
};

export const CreateChannel = async (req: Request, res: Response) => {
  try {
    const { workspaceId, name } = req.body;
    const userId = (req as any).user.id;

    if (!userId || !workspaceId || !name) {
      return res.status(400).json({
        success: false,
        message: "Missing required data",
        channel: null,
      });
    }

    const membership = await Member.findOne({ userId, workspaceId });
    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this workspace",
        channel: null,
      });
    }

    if (membership.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can create channels",
        channel: null,
      });
    }

    const parsedName = name.trim().replace(/\s+/g, "-").toLowerCase();

    const existing = await Channel.findOne({ workspaceId, name: parsedName });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Channel name already exists in this workspace",
        channel: null,
      });
    }

    const channel = await Channel.create({
      name: parsedName,
      workspaceId,
    });

    return res.status(201).json({
      success: true,
      channel,
      message: "Channel created successfully",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const getByIdChannel = async (req: Request, res: Response) => {
  try {
    const { channelId } = req.params;
    const userId = (req as any).user.id;

    if (!userId || !channelId) {
      return res.status(400).json({
        success: false,
        message: "Missing required data",
        channel: null,
      });
    }

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        channel: null,
        message: "Channel not found"
      });
    }
    const member = await Member.findOne({ userId, workspaceId: channel.workspaceId });
    if (!member) {
      return res.status(404).json({
        success: false,
        channel: null,
        message: "Unautorized"
      });
    }
    return res.status(201).json({
      success: true,
      channel
    });

  } catch (error) {
    console.log(error);
    return res.status(201).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export const updateChannel = async (req: Request, res: Response) => {
  try {
    const { name, channelId } = req.body;
    const userId = (req as any).user.id;

    if (!userId || !name || !channelId) {
      return res.status(400).json({
        success: false,
        message: "Missing required data",
        channel: null,
      });
    }
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "channel not founded",
        channel: null,
      });
    }
    const membership = await Member.findOne({ userId, workspaceId: channel?.workspaceId });
    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "You are not a member of this workspace",
        channel: null,
      });
    }

    if (membership.role !== "admin") {
      return res.status(404).json({
        success: false,
        message: "Only admins can create channels",
        channel: null,
      });
    }
    channel.name = name;
    channel.save();

    return res.status(201).json({
      success: true,
      channel,
      message: "Channel updated successfully",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const removeChannel = async (req: Request, res: Response) => {
  try {
    const { channelId } = req.params;
    const userId = (req as any).user.id;

    if (!userId || !channelId) {
      return res.status(400).json({
        success: false,
        message: "Missing required data",
        channel: null,
      });
    }
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "channel not founded",
        channel: null,
      });
    }
    const membership = await Member.findOne({ userId, workspaceId: channel?.workspaceId });
    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "You are not a member of this workspace",
        channel: null,
      });
    }

    if (membership.role !== "admin") {
      return res.status(404).json({
        success: false,
        message: "Only admins can create channels",
        channel: null,
      });
    }
    await channel.deleteOne();

    return res.status(201).json({
      success: true,
      channel,
      message: "Channel updated successfully",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
