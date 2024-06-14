import { env } from "$env/dynamic/private";
import { createTransport } from "nodemailer";

const transporter = createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: {
        user: env.SMTP_EMAIL_ADDRESS,
        pass: env.SMTP_EMAIL_PASSWORD
    }
});

export const sendPasswordResetEmail = async (userAccount, oneTimeTokenValue) => {
    let formatted = `Hi ${userAccount.firstName}! <br><br>
    A request to reset your password has been received.<br>
    If this was not you, you can safely ignore this email.<br><br><br>
    
    <a href="http://localhost:5173/confirm-password-reset?token=${oneTimeTokenValue}">Reset Password</a>`;

    const mailOptions = {
        from: env.SMTP_EMAIL_ADDRESS,
        to: userAccount.emailAddress,
        subject: `Password Reset Requested`,
        html: formatted
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log("Email sent: " + info.response);
        }
    });
};
