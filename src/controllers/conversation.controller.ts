import { Request, Response } from "express";
import memberModel from "../models/member.model";
import { ConversationModel } from "../models/message.model";

export const createOrGetConversation = async (req: Request, res: Response) => {
  const { memberId, workspaceId } = req.body;
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const currentMember = await memberModel.findOne({
      userId: userId,
      workspaceId: workspaceId,
    });

    const otherMember = await memberModel.findById(memberId);

    if(!otherMember){
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    const existingConversation = await ConversationModel.findOne({
      workspaceId: workspaceId,
      $or: [
        { memberOneId: currentMember?._id, memberTwoId: otherMember._id },
        { memberOneId: otherMember._id, memberTwoId: currentMember?._id },
      ],
    });

    if(existingConversation){
      return res.status(200).json({ success: true, conversation: existingConversation });
    }

    const newConversation = await ConversationModel.create({
      workspaceId: workspaceId,
      memberOneId: currentMember?._id,
      memberTwoId: otherMember._id,
    });
    if(!newConversation){
        return res.status(400).json({ success: false, message: "Conversation not found" });
    }
    return res.status(201).json({ success: true, conversation: newConversation})

  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
