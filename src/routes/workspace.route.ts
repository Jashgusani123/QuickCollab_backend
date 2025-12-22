import express from "express";
import { auth } from "../middlewares/auth.middleware";
import { createWorkspace, getInfoById, getMyWorkspaces, getWorkspaceById, joinWorkspace, removeWorkspace, updateJoinCode, updateWorkspace } from "../controllers/workspace.controller";

const router = express.Router();

// Create new workspace
router.post("/", auth, createWorkspace);

// Get all workspaces 
router.get("/my-workspaces", auth, getMyWorkspaces);

// Get current workspace 
router.post("/get-one", auth, getWorkspaceById);

// update workspace 
router.put("/current-update", auth, updateWorkspace);

// remove workspace 
router.delete("/current-remove/:workspaceId", auth, removeWorkspace);

// joinCode change
router.put("/change-joincode" , auth , updateJoinCode)

// join workspace
router.post("/join-workspace" , auth , joinWorkspace)
// information for unauthorized
router.post("/get-info" , auth , getInfoById)



export default router;
