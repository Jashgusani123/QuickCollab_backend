import { Router } from "express";
import { createOrGetConversation } from "../controllers/conversation.controller";
import { auth } from "../middlewares/auth.middleware";

const router = Router();

router.post("/createOrGet", auth , createOrGetConversation);

export default router;