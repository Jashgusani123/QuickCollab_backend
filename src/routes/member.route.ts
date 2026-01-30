import { Router } from "express";

import { createUser, getUser, loginUser, logoutUser } from "../controllers/auth.controller";
import { auth } from "../middlewares/auth.middleware";
import { currentMember, getMemberById, getMembers } from "../controllers/member.controller";

const router = Router();

// current member
router.post("/current", auth, currentMember);
// get all members
router.post("/get-all", auth, getMembers);
// get by Id member
router.post("/get_member", auth, getMemberById);

export default router;
