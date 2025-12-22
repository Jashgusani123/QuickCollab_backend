import { Request, Response } from "express";
import { MessageModel, ReactionModel } from "../models/message.model";
import { getMember } from "../utils/useable_funcs";

export const addReaction = async (req: Request, res: Response) => {
  const { messageId, value } = req.body;

  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const message = await MessageModel.findById(messageId);
    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    const member = await getMember(message.workspaceId, userId);
    if (!member) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const existingReaction = await ReactionModel.findOne({
      messageId,
      memberId: member._id,
      value,
    });

    if (existingReaction) {
      await existingReaction.deleteOne();
      const updatedReactions = await ReactionModel.find({ messageId });

      return res.status(200).json({
        success: true,
        message: "Reaction removed",
        reactions: updatedReactions,
      });
    }

    const previousReaction = await ReactionModel.findOne({
      messageId,
      memberId: member._id,
    });

    if (previousReaction) {
      await previousReaction.deleteOne();
    }

    // 5. Create new reaction
    const newReaction = await ReactionModel.create({
      messageId,
      memberId: member._id,
      value,
      workspaceId:member.workspaceId
    });

    const updatedReactions = await ReactionModel.find({ messageId });

    return res.status(201).json({
      success: true,
      message: "Reaction added",
      reaction: newReaction,
      reactions: updatedReactions,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
