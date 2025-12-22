import { Router } from "express";
import { createOrGetConversation } from "../controllers/conversation.controller";

const router = Router();

router.post("/createOrGet",  createOrGetConversation);

export default router;