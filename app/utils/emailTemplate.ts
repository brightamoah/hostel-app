import type { User } from "#auth-utils";

export function getEmailTemplate(verificationUrl: string, user: Omit<User, "lastLogin" | "role">) {
  const htmlTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Verify Your Email - Kings Hostel Management</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Kings Hostel Management!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${user.name}!</h2>
            
            <p>Thank you for signing up! To complete your registration and start using your account, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">Verify My Email</a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="background: #eee; padding: 10px; border-radius: 4px; word-break: break-all; font-family: monospace; font-size: 14px;">${verificationUrl}</p>
            
            <hr style="border: none; height: 1px; background: #ddd; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #666;">
              This link will expire in 24 hours for security reasons. If you didn't create an account with us, please ignore this email.
            </p>
            
            <p style="font-size: 14px; color: #666;">
              Best regards,<br>
              The Kings Hostel Management Team
            </p>
          </div>
        </body>
      </html>
    `;

  const textTemplate = `
      Welcome to Kings Hostel Management!
      
      Hello ${user.name}!
      
      Thank you for signing up! To complete your registration, please verify your email address by visiting:
      
      ${verificationUrl}
      
      This link will expire in 10 minutes for security reasons.
      
      If you didn't create an account with us, please ignore this email.
      
      Best regards,
      The Kings Hostel Management Team
    `;

  return { htmlTemplate, textTemplate };
}

export function getResetPasswordTemplate(resetUrl: string, userName: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset Your Password</h2>
      <p>Hi ${userName},</p>
      <p>You requested a password reset for your Kings Hostel Management account. Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="background-color: #007BFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>This link will expire in 10 minutes. If you didn't request this, ignore this email.</p>
      <p>Best,<br>Kings Hostel Management Team</p>
    </div>
  `;
  const text = `Hi ${userName},\n\nYou requested a password reset. Click here to reset: ${resetUrl}\n\nThis link expires in 10 minutes.\n\nBest,\nKings Hostel Management Team`;
  return { html, text };
}
