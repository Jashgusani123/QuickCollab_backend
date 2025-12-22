import { Request, RequestHandler, Response } from "express";
import Member from "../models/member.model";
import { populateUser } from "../utils/useable_funcs";
import { ObjectId } from "mongoose";

export const currentMember = async (req: Request, res: Response) => {
    try {
        const { workspaceId } = req.body;

        const userId = (req as any).user.id;
        if (!userId || !workspaceId) {
            res.status(404).json({ success: false, message: "Not vaild request", member: null })
        }

        const member = await Member.findOne({ userId, workspaceId });

        if (!member) {
            res.status(404).json({ success: false, message: "Not vaild request", member: null })
        }

        res.status(200).json({ success: true, member: member })
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}

export const getMembers = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.body;
    const userId = (req as any).user.id;

    if (!userId || !workspaceId) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
        members: [],
      });
    }

    // Check if user is a member
    const member = await Member.findOne({ userId, workspaceId });
    if (!member) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
        members: [],
      });
    }

    // Get all members of the same workspace
    const data = await Member.find({ workspaceId });

    const members = [];
    for (const m of data) {
      const user = await populateUser(m.userId as ObjectId);
      if (user) {
        members.push({ ...m.toObject(), user });
      }
    }

    return res.status(200).json({
      success: true,
      members,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};