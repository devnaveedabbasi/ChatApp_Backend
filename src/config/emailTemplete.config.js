export const Verification_Email_Template = `
  <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:8px;box-shadow:0 4px 15px rgba(0,0,0,0.1);overflow:hidden;border:1px solid #ddd;">
    <div style="background-color:#4CAF50;color:white;padding:20px;text-align:center;font-size:26px;font-weight:bold;">
      Verify Your Email
    </div>
    <div style="padding:25px;color:#333;line-height:1.8;font-family:Arial,sans-serif;">
      <p>Hello,</p>
      <p>Thank you for signing up! Please confirm your email address by entering the code below:</p>
      <div style="margin:20px 0;font-size:22px;color:#4CAF50;background:#e8f5e9;border:1px dashed #4CAF50;padding:10px;text-align:center;border-radius:5px;font-weight:bold;letter-spacing:2px;">
        {verificationCode}
      </div>
      <p>If you did not create an account, no further action is required. If you have any questions, feel free to contact our support team.</p>
    </div>
    <div style="background-color:#f4f4f4;padding:15px;text-align:center;color:#777;font-size:12px;border-top:1px solid #ddd;">
      &copy; ${new Date().getFullYear()} Your Company. All rights reserved.
    </div>
  </div>
`;



export const Welcome_Email_Template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Our Community</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; color: #333;">
      <div style="max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); overflow: hidden; border: 1px solid #ddd;">
          <div style="background-color: #007BFF; color: white; padding: 20px; text-align: center; font-size: 26px; font-weight: bold;">
              Welcome to Our Community!
          </div>
          <div style="padding: 25px; line-height: 1.8;">
              <p style="font-size: 18px; margin: 20px 0;">Hello {name},</p>
              <p>We’re thrilled to have you join us! Your registration was successful, and we’re committed to providing you with the best experience possible.</p>
              <p>Here’s how you can get started:</p>
              <ul>
                  <li>Explore our features and customize your experience.</li>
                  <li>Stay informed by checking out our blog for the latest updates and tips.</li>
                  <li>Reach out to our support team if you have any questions or need assistance.</li>
              </ul>
              <a href="#" style="display: inline-block; padding: 12px 25px; margin: 20px 0; background-color: #007BFF; color: white; text-decoration: none; border-radius: 5px; text-align: center; font-size: 16px; font-weight: bold;">Get Started</a>
              <p>If you need any help, don’t hesitate to contact us. We’re here to support you every step of the way.</p>
          </div>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; color: #777; font-size: 12px; border-top: 1px solid #ddd;">
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
`;


export const Reset_Password_Email_Template = `
  <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:8px;box-shadow:0 4px 15px rgba(0,0,0,0.1);overflow:hidden;border:1px solid #ddd;">
    <div style="background-color:#FF5722;color:white;padding:20px;text-align:center;font-size:26px;font-weight:bold;">
      Reset Your Password
    </div>
    <div style="padding:25px;color:#333;line-height:1.8;font-family:Arial,sans-serif;">
      <p>Hello,</p>
      <p>We received a request to reset your password. Click the button below to set a new password:</p>
      <div style="text-align:center;margin:30px 0;">
        <a href="{resetLink}" style="background-color:#FF5722;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;font-size:16px;font-weight:bold;">
          Reset Password
        </a>
      </div>
      <p>This link will expire in 15 minutes for security reasons.</p>
      <p>If you didn’t request a password reset, please ignore this email or contact support.</p>
    </div>
    <div style="background-color:#f4f4f4;padding:15px;text-align:center;color:#777;font-size:12px;border-top:1px solid #ddd;">
      &copy; ${new Date().getFullYear()} Your Company. All rights reserved.
    </div>
  </div>
`;
