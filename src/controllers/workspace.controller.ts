import { Request, Response } from "express";
import Workspace from "../models/workspace.model";
import { generateCode } from "../utils/useable_funcs";
import Member from "../models/member.model";
import Channel from "../models/channel.model";

export const createWorkspace = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const userId = (req as any).user.id;
    const joinCode = generateCode();
    const workspace = await Workspace.create({
      name,
      userId: userId,
      joinCode
    });
    await Member.create({
      userId,
      workspaceId: workspace._id,
      role: "admin"
    });
    await Channel.create({
      name: "general",
      workspaceId: workspace._id
    })
    res.status(201).json({ success: true, workspaceId: workspace._id, message: "Workspace created !!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getMyWorkspaces = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    if (!userId) {
      res.status(404).json({ success: false, message: "Unauthorized", workspaces: [] })
    }
    const memberships = await Member.find({ userId }).select("workspaceId");
    const workspaceIds = memberships.map(m => m.workspaceId);
    const workspaces = await Workspace.find({ _id: { $in: workspaceIds } });

    res.status(200).json({ success: true, workspaces });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getWorkspaceById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { workspaceId } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!workspaceId) {
      return res.status(400).json({ success: false, message: "Workspace ID is required" });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ success: false, message: "Workspace not found" });
    }

    const membership = await Member.findOne({
      userId,
      workspaceId,
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not a member of this workspace",
      });
    }

    return res.status(200).json({
      success: true,
      workspaces: workspace,
    });

  } catch (error) {
    console.error("Error in getWorkspaceById:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateWorkspace = async (req: Request, res: Response) => {
  try {
    const { workspaceId, name } = req.body;
    const userId = (req as any).user.id;

    if (!userId || !workspaceId || !name) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
        workspace: null
      });
    }

    const member = await Member.findOne({ userId, workspaceId });

    if (!member || member.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
        workspace: null
      });
    }

    const updatedWorkspace = await Workspace.findByIdAndUpdate(
      workspaceId,
      { name },
      { new: true }
    );

    if (!updatedWorkspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
        workspace: null
      });
    }

    return res.status(200).json({
      success: true,
      message: "Workspace updated successfuly",
      workspace: updatedWorkspace,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const removeWorkspace = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const userId = (req as any).user.id;

    if (!userId || !workspaceId) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    // Check permission
    const member = await Member.findOne({ userId, workspaceId });
    if (!member || member.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const members = await Member.find({ workspaceId });

    for (const m of members) {
      await Member.findByIdAndDelete(m._id);
    }

    // Delete workspace 
    await Workspace.findByIdAndDelete(workspaceId);

    return res.status(200).json({
      success: true,
      message: "Workspace deleted successfully",
      workspace: null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateJoinCode = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.body;
    const userId = (req as any).user.id;

    if (!userId || !workspaceId) {
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
    const joinCode = generateCode();

    const updatedWorkspace = await Workspace.findByIdAndUpdate(workspaceId, { joinCode })

    return res.status(201).json({
      success: true,
      workspace: updatedWorkspace,
      message: "JoinCode updated",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export const joinWorkspace = async (req: Request, res: Response) => {
  try {
    const { workspaceId, joinCode } = req.body;
    const userId = (req as any).user.id;

    if (!userId || !workspaceId || !joinCode) {
      return res.status(400).json({
        success: false,
        message: "Missing required data",
      });
    }

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }

    if (workspace.joinCode.toLowerCase() !== joinCode.toLowerCase()) {
      return res.status(401).json({
        success: false,
        message: "Invalid join code",
      });
    }

    const existingMember = await Member.findOne({ workspaceId, userId });
    if (existingMember) {
      return res.status(409).json({
        success: false,
        message: "Already a member of this workspace",
      });
    }

    await Member.create({ userId, workspaceId, role: "member" });

    return res.status(200).json({
      success: true,
      message: `Joined workspace (${workspace.name})`,
      workspace,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getInfoById = async (req:Request , res:Response)=>{
  try {
    const { workspaceId } = req.body;
    const userId = (req as any).user.id;

    if (!userId || !workspaceId) {
      return res.status(400).json({
        success: false,
        message: "Missing required data",
      });
    }
    const member = await Member.findOne({workspaceId ,userId})
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }

    return res.status(200).json({
      success: true,
      workspace:{
        name:workspace.name,
        isMember:!!member
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
