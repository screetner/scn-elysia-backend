import { EmailMessage } from "@azure/communication-email";
import client from "@/libs/emailclient";

const htmlContent = (signupLink: string, token: string) => `
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>
                Welcome to Screetner Studio!
            </title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f7; color: #333; line-height: 1.6; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 20px auto; background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #1E1E1E; font-size: 24px; text-align: center;">Welcome to Screetner Studio!</h2>
                <p>Thank you for your interest in signing up. Please click the button below to complete your registration:</p>
                <p style="color: red; font-weight: bold; text-align: center;">Please complete your registration within 7 days of receiving this email.</p>
                <div style="text-align: center;">
                    <a href="${signupLink}" style="display: inline-block; padding: 12px 20px; background-color: #007BFF; color: white; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; text-align: center;">
                        Complete Registration
                    </a>
                </div>
                <p style="margin-top: 20px;">If the button above doesn’t work, please copy and paste the following link into your web browser:</p>
                <p>${token}</p>
                <p>Best regards,<br/>The Screetner Studio Team</p>
            </div>
        </body>
    </html>
`;


function createEmailMessage(recipientEmail: string, subjectContent: string, signupLink: string, token: string): EmailMessage {
    return {
        sender: "DoNotReply@screetner.studio",
        content: {
            subject: `${subjectContent}`,
            html: htmlContent(signupLink, token),
        },
        recipients: {
            to: [{ email: `${recipientEmail}` }],
        },
    };
}

export default async function sendEmailMessage(recipientEmail: string, subjectContent: string, signupLink: string, token: string) {
    const emailMessage = createEmailMessage(recipientEmail, subjectContent, signupLink, token);
    await client.send(emailMessage);
}
