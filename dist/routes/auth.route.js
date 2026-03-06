"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
router.post("/register", authController.register.bind(authController));
router.post("/login", authController.login.bind(authController));
router.get("/profile", auth_middleware_1.authMiddleware, authController.getProfile.bind(authController));
router.put("/profile", auth_middleware_1.authMiddleware, authController.updateProfile.bind(authController));
router.post("/user/profile-picture", auth_middleware_1.authMiddleware, upload_middleware_1.uploadProfilePicture.single("profilePicture"), authController.updateProfilePicture.bind(authController));
router.post("/request-password-reset", authController.sendResetPasswordEmail);
router.post("/reset-password/:token", authController.resetPassword);
exports.default = router;
//# sourceMappingURL=auth.route.js.map