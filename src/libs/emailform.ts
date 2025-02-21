import { EmailMessage } from '@azure/communication-email'
import client from '@/libs/emailclient'
import { FailSubject, SuccessSubject } from '@/models/python'

const htmlInviteContent = (signupLink: string, token: string) => `
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
`

function createEmailInviteMessage(
  recipientEmail: string,
  subjectContent: string,
  signupLink: string,
  token: string,
): EmailMessage {
  return {
    sender: 'DoNotReply@screetner.studio',
    content: {
      subject: `${subjectContent}`,
      html: htmlInviteContent(signupLink, token),
    },
    recipients: {
      to: [{ email: `${recipientEmail}` }],
    },
  }
}

export async function sendEmailInviteMessage(
  recipientEmail: string,
  subjectContent: string,
  signupLink: string,
  token: string,
) {
  const emailMessage = createEmailInviteMessage(
    recipientEmail,
    subjectContent,
    signupLink,
    token,
  )
  await client.send(emailMessage)
}

const htmlAlertContent = (
  status: boolean,
  details: {
    fileName?: string
    uploadTime: string
    errorMessage?: string
    countAsset?: number
  },
) => `
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>
                Asset Upload ${status ? 'Success' : 'Failed'} - Screetner Studio
            </title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f7; color: #333; line-height: 1.6; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 20px auto; background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <div style="text-align: center; margin-bottom: 20px;">
                    ${
                      status
                        ? '<div style="color: #28a745; font-size: 24px;">✔️ Upload Successful</div>'
                        : '<div style="color: #dc3545; font-size: 24px;">❌ Upload Failed</div>'
                    }
                </div>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    ${
                      status && details.countAsset
                        ? `<p style="margin: 5px 0;"><strong>Successfully uploaded:</strong> ${details.countAsset} image${details.countAsset > 1 ? 's' : ''}</p>`
                        : ''
                    }
                    ${
                      !status && details.fileName
                        ? `<p style="margin: 5px 0;"><strong>File:</strong> ${details.fileName}</p>`
                        : ''
                    }
                    <p style="margin: 5px 0;"><strong>Time:</strong> ${details.uploadTime}</p>
                    ${
                      !status && details.errorMessage
                        ? `<p style="margin: 5px 0; color: #dc3545;"><strong>Error:</strong> ${details.errorMessage}</p>`
                        : ''
                    }
                </div>

                ${
                  status
                    ? `<p>Your asset${details.countAsset && details.countAsset > 1 ? 's have' : ' has'} been successfully uploaded to Screetner Studio.</p>`
                    : `<p>Unfortunately, there was an issue uploading your asset. Please try again or contact support if the problem persists.</p>`
                }

                <div style="margin-top: 20px; text-align: center; padding: 10px; background-color: ${status ? '#e8f5e9' : '#ffebee'}; border-radius: 5px;">
                    <p style="margin: 0; font-size: 14px; color: ${status ? '#2e7d32' : '#c62828'};">
                        Current Status: ${status ? 'Asset Upload Complete' : 'Upload Process Failed'}
                    </p>
                </div>

                <p style="margin-top: 20px; font-size: 14px; color: #666; text-align: center;">
                    This is an automated message from Screetner Studio
                </p>
            </div>
        </body>
    </html>
`

function createEmailAlertMessage(
  recipientEmail: string,
  isCanSend: boolean,
  countAsset?: number,
  fileName?: string,
  errorMessage?: string,
): EmailMessage {
  const details = isCanSend
    ? {
        uploadTime: new Date().toLocaleString(),
        countAsset: countAsset!,
      }
    : {
        fileName: fileName!,
        uploadTime: new Date().toLocaleString(),
        errorMessage: errorMessage!,
      }
  return {
    sender: 'DoNotReply@screetner.studio',
    content: {
      subject: isCanSend ? `${SuccessSubject}` : `${FailSubject}`,
      html: htmlAlertContent(isCanSend, details),
    },
    recipients: {
      to: [{ email: `${recipientEmail}` }],
    },
  }
}

export async function sendEmailAlertMessage(
  recipientEmail: string,
  isCanSend: boolean,
  countAsset?: number,
  fileName?: string,
  errorMessage?: string,
) {
  const emailMessage = isCanSend
    ? createEmailAlertMessage(recipientEmail, isCanSend, countAsset)
    : createEmailAlertMessage(
        recipientEmail,
        isCanSend,
        0,
        fileName,
        errorMessage,
      )
  await client.send(emailMessage)
}
