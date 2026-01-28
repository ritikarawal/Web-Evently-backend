import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { uploadProfilePicture, handleUploadError } from "../middlewares/upload.middleware";

const router = Router();
const authController = new AuthController();

router.post("/register", authController.register.bind(authController));
router.post("/login", authController.login.bind(authController));
router.post(
    "/user/profile-picture",
    authMiddleware,
    uploadProfilePicture.single("profilePicture"),
    authController.updateProfilePicture.bind(authController)
);

export default router;
