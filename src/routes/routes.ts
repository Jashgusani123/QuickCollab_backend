import {Router} from "express";
import authRoutes from "./auth.route";
import memberRoutes from "./member.route";
import workspaceRoutes from "./workspace.route";
import channelRoutes from "./channel.route";
import messageRoutes from "./message.route";
import reactionRoutes from "./reaction.route";
import conversationRoutes from "./conversation.route";
import adminRoutes from "./admin.route";
import transcriptRoutes from "./transcript.route";
import requestRoutes from "./request.route";

const apiRouter = Router();

// Auth routes
apiRouter.use("/auth", authRoutes);

// Workspace routes
apiRouter.use("/workspaces", workspaceRoutes);

// Member routes
apiRouter.use("/members", memberRoutes);

// Channel routes
apiRouter.use("/channels", channelRoutes);

// Message routes
apiRouter.use("/messages", messageRoutes);

// Reaction routes
apiRouter.use("/reactions", reactionRoutes);

// Conversation routes
apiRouter.use("/conversations", conversationRoutes);

// Admin routes
apiRouter.use("/admin", adminRoutes);

// Transcript routes
apiRouter.use("/transcript", transcriptRoutes);

// Request routes
apiRouter.use("/request", requestRoutes);

export default apiRouter;