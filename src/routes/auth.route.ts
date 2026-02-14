import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { uploadProfilePicture, handleUploadError } from "../middlewares/upload.middleware";

const router = Router();
const authController = new AuthController();

router.post("/register", authController.register.bind(authController));
router.post("/login", authController.login.bind(authController));
router.get("/profile", authMiddleware, authController.getProfile.bind(authController));
router.put("/profile", authMiddleware, authController.updateProfile.bind(authController));
router.post(
    "/user/profile-picture",
    authMiddleware,
    uploadProfilePicture.single("profilePicture"),
    authController.updateProfilePicture.bind(authController)
);
router.post("/request-password-reset", authController.sendResetPasswordEmail);
router.post("/reset-password/:token", authController.resetPassword);

export default router;
