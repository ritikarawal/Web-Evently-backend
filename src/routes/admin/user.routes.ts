import { Router } from "express";
import {  adminMiddleware, authMiddleware } from "../../middlewares/auth.middleware";
import { AdminUserController } from "../../controllers/admin/user.controller";
import { uploadProfilePicture } from "../../middlewares/upload.middleware";
let adminUserController = new AdminUserController();

const router = Router();

router.use(authMiddleware); // apply all with middleware
router.use(adminMiddleware); // apply all with middleware

router.post("/", uploadProfilePicture.single("image"), adminUserController.createUser);
router.get("/", adminUserController.getAllUsers);
router.put("/:id", uploadProfilePicture.single("image"), adminUserController.updateUser);
router.delete("/:id", adminUserController.deleteUser);
router.get("/:id", adminUserController.getUserById);

export default router;