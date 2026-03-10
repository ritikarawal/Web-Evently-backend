"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUploadError = exports.uploadProfilePicture = exports.uploads = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
exports.uploads = path_1.default.join(__dirname, "../../uploads/profile-pictures");
// Create uploads directory if it doesn't exist
if (!fs_1.default.existsSync(exports.uploads)) {
    fs_1.default.mkdirSync(exports.uploads, { recursive: true });
}
// Configure storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, exports.uploads);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `profile-${uniqueSuffix}${path_1.default.extname(file.originalname)}`);
    },
});
// File filter to accept only images
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const fileExtension = path_1.default.extname(file.originalname).toLowerCase();
    if (allowedMimeTypes.includes(file.mimetype) &&
        allowedExtensions.includes(fileExtension)) {
        cb(null, true);
    }
    else {
        cb(new Error("Only image files are allowed (jpeg, png, gif, webp)"));
    }
};
// Create multer upload instance
exports.uploadProfilePicture = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});
// Error handler middleware for multer
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
                success: false,
                message: "Too many files uploaded",
            });
        }
    }
    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message || "File upload failed",
        });
    }
    next();
};
exports.handleUploadError = handleUploadError;
//# sourceMappingURL=upload.middleware.js.map