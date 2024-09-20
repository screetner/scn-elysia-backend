import { EmailMessage } from "@azure/communication-email";
import client from "@/libs/emailclient";

const htmlContent = (signupLink: string) => `
    <html lang="">
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2 style="color: #333;">Welcome to Screetner Studio!</h2>
            <p>Thank you for your interest in signing up. Please click the button below to complete your registration:</p>
            <a href="${signupLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Complete Registration</a>
            <p>If the button above doesn’t work, please copy and paste the following link into your web browser:</p>
            <p><a href="${signupLink}" style="color: #4CAF50;">${signupLink}</a></p>
            <p>Best regards,<br/>The Screetner Studio Team</p>
        </body>
    </html>
`;

// ฟังก์ชันสำหรับสร้างอีเมล
function createEmailMessage(recipientEmail: string, subjectContent: string, signupLink: string): EmailMessage {
    return {
        sender: "DoNotReply@screetner.studio",
        content: {
            subject: `${subjectContent}`,
            html: htmlContent(signupLink), // ใช้ HTML แทน plainText
        },
        recipients: {
            to: [{ email: `${recipientEmail}` }],
        },
    };
}

export default async function sendEmailMessage(recipientEmail: string, subjectContent: string, signupLink: string) {
    const emailMessage = createEmailMessage(recipientEmail, subjectContent, signupLink);
    await client.send(emailMessage);
}
