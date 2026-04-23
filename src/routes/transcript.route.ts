import { Router } from "express";
import multer from "multer";
import { parseTranscript } from "../controllers/transcript.controller";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "text/plain") {
      cb(null, true);
    } else {
      cb(new Error("Only .txt files are allowed"));
    }
  },
});

// Upload a .txt file containing YouTube transcript HTML and get parsed segments
router.post("/parse", upload.single("file"), parseTranscript);

export default router;
