import { Router } from "express";
import { uploadFileController } from "../controllers/upload_ctrl/upload";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/upload", authenticateToken, uploadFileController);

export default router;