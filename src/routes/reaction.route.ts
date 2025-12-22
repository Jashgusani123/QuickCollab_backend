import { Router } from "express";
import { addReaction } from "../controllers/reactions.controller";
import { auth } from "../middlewares/auth.middleware";


const router = Router();

router.post("/toggle", auth ,addReaction)

export default router;
