"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const EMAIL_PASS = process.env.EMAIL_PASSWORD;
const EMAIL_USER = process.env.EMAIL_USER;
exports.transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});
const sendEmail = async (to, subject, html) => {
    console.log(`Attempting to send email to: ${to}, subject: ${subject}`);
    const mailOptions = {
        from: `Evently <${EMAIL_USER}>`,
        to,
        subject,
        html,
    };
    try {
        const result = await exports.transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${to}:`, result);
        return result;
    }
    catch (error) {
        console.error(`Failed to send email to ${to}:`, error);
        throw error;
    }
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=email.js.map