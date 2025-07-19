import { Router } from "express";
import { getCurrentUserProfileCtrl, updateUserProfileCtrl } from "../controllers/user_profile_ctrl/userProfileCtrl";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

// Apply authentication middleware to all user profile routes
router.use(authenticateToken);

// Update user profile - requires authentication
router.patch("/update", updateUserProfileCtrl);

// Get user profile - requires authentication
router.get("/profile", getCurrentUserProfileCtrl);


export default router; 