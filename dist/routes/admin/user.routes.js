"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authorized_middleware_1 = require("../../middlewares/authorized.middleware");
const user_controller_1 = require("../../controllers/admin/user.controller");
const upload_middleware_1 = require("../../middlewares/upload.middleware");
let adminUserController = new user_controller_1.AdminUserController();
const router = (0, express_1.Router)();
router.use(authorized_middleware_1.authorizedMiddleware); // apply all with middleware
router.use(authorized_middleware_1.adminMiddleware); // apply all with middleware
router.post("/", upload_middleware_1.uploadProfilePicture.single("image"), adminUserController.createUser);
router.get("/", adminUserController.getAllUsers);
router.put("/:id", upload_middleware_1.uploadProfilePicture.single("image"), adminUserController.updateUser);
router.delete("/:id", adminUserController.deleteUser);
router.get("/:id", adminUserController.getUserById);
exports.default = router;
//# sourceMappingURL=user.routes.js.map