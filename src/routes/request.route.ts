import {Router} from "express";
import { auth } from "../middlewares/auth.middleware";
import { acceptRequest, declineRequest, getAllrequests, sentRequest } from "../controllers/request.controller";

const router = Router();

// Sent friend request
router.post("/sent", auth, sentRequest);

// Accept friend request
router.post("/accept-request", auth, acceptRequest);

// Decline friend request
router.post("/decline-request", auth, declineRequest);

// Get all requests
router.get("/", auth, getAllrequests);

export default router;