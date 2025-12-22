
import express from "express";
import { auth } from "../middlewares/auth.middleware";
import { createWorkspace, getMyWorkspaces, getWorkspaceById, removeWorkspace, updateWorkspace } from "../controllers/workspace.controller";
import { CreateChannel, getByIdChannel, getChannels, removeChannel, updateChannel } from "../controllers/channel.controller";

const router = express.Router();

// Get channel
router.get("/get-channels/:workspaceId", auth, getChannels)
// create channel
router.post("/create", auth, CreateChannel)
// get one channel
router.get("/current/:channelId", auth, getByIdChannel)
// update channel
router.post("/update", auth, updateChannel)
// remove channel
router.delete("/remove/:channelId", auth,removeChannel)

export default router;
