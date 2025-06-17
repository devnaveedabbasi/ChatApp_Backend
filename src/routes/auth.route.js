import { Router } from "express";
import {
  checkAuth,
  forgetPassword,
  login,
  logout,
  refreshToken,
  registerUser,
  resendOtp,
  resetPassword,
  updateProfile,
  verifyUser,
} from "../controllers/auth.controller.js";
import protectedRoute from "../middlewears/auth.middlewares.js";
import { upload } from "../middlewears/multer.middlewares.js";

const router = Router();

// 👤 Normal Auth Routes

router.post("/register", registerUser);
router.post("/verify-otp", verifyUser);
router.post("/resend-otp/:userId", resendOtp);
router.post("/login", login);
router.post("/logout", protectedRoute, logout);
router.post("/forget-Password", forgetPassword);
// router.post("/reset-password", resetPassword);
router.post("/reset-password/:token", resetPassword);

router.post("/refresh-token", refreshToken);

router.put(
  "/update-profile",
  protectedRoute,
  upload.single("profile"),
  updateProfile
);
router.get("/check-auth", protectedRoute, checkAuth);

export default router;
