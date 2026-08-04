import { Router } from "express";

import { createUser, getUnreadCounts, getUser, loginUser, logoutUser } from "../controllers/auth.controller";
import { auth } from "../middlewares/auth.middleware";

const router = Router();

// Register
router.post("/register", createUser);

// Login
router.post("/login", loginUser);

// Logout
router.post("/logout", logoutUser);

// get user
router.get("/me", auth , getUser);

// get user
router.post("/me/unread-counts", auth , getUnreadCounts);

export default router;
