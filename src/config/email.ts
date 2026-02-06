import nodemailer from 'nodemailer';
const EMAIL_PASS = process.env.EMAIL_PASSWORD as string;
const EMAIL_USER = process.env.EMAIL_USER as string;

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    console.log(`Attempting to send email to: ${to}, subject: ${subject}`);
    const mailOptions = {
        from: `Mero app <${EMAIL_USER}>`,
        to,
        subject,
        html,
    };
    try {
        const result = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${to}:`, result);
        return result;
    } catch (error) {
        console.error(`Failed to send email to ${to}:`, error);
        throw error;
    }
}