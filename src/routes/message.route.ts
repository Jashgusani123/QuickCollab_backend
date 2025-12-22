import { Router } from "express";
import { auth } from "../middlewares/auth.middleware";
import { createMessage, getMessage, getMessages, removeMessage, updateMessage } from "../controllers/message.controller";
import { upload } from "../config/multer";


const router = Router();

// sent message 
router.post("/create", auth , upload.single("image"), createMessage);
// all messages
router.post("/list", auth , getMessages);
// update message 
router.put("/update", auth , updateMessage);
// update message 
router.post("/remove", auth , removeMessage);
// getById message 
router.post("/getById", auth , getMessage);



export default router;
