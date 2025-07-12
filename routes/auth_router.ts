import { Router } from "express";
import { RegisterUser } from "../controllers/auth_ctrl/auth";
import { LoginUser } from "../controllers/auth_ctrl/login";
import { refreshToken } from "../controllers/auth_ctrl/refresh";
import { ForgotPassword } from "../controllers/auth_ctrl/forgot_password";
import { ResetPassword } from "../controllers/auth_ctrl/resetPassword";

const router = Router();

router.post("/signup", RegisterUser);
router.post("/login", LoginUser);
router.post("/refresh", refreshToken);
router.post("/forgot-password", ForgotPassword);
router.patch("/reset-password", ResetPassword);

export default router;