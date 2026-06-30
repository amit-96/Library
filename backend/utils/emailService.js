const nodemailer = require('nodemailer');

/**
 * Send a professional HTML password reset email to the user.
 * Falls back to local console mock print if SMTP variables are not configured.
 */
const sendResetPasswordEmail = async (email, name, token) => {
  const resetUrl = `http://localhost:3000/reset-password?token=${token}`;

  // If email SMTP configuration is default or missing, run in sandbox mock mode
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
    console.log('\n==================================================');
    console.log('📬  [MOCK EMAIL] PASSWORD RESET REQUESTED');
    console.log(`To: ${name} <${email}>`);
    console.log(`Reset Token: ${token}`);
    console.log(`Reset Link: ${resetUrl}`);
    console.log('==================================================\n');
    return { success: true, mock: true, resetUrl };
  }

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nalanda Digital Library - Reset Your Password</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background-color: #f8fafc;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
        }
        .header {
          background-color: #0B2E6B;
          padding: 30px 20px;
          text-align: center;
          border-bottom: 4px solid #FFD700;
        }
        .header h1 {
          color: #ffffff;
          margin: 0;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }
        .content {
          padding: 40px 30px;
          text-align: left;
          color: #334155;
          line-height: 1.6;
        }
        .content p {
          margin: 0 0 20px 0;
          font-size: 15px;
        }
        .btn-container {
          text-align: center;
          margin: 30px 0;
        }
        .btn-reset {
          background-color: #FFD700;
          color: #0B2E6B !important;
          text-decoration: none;
          padding: 14px 30px;
          font-size: 14px;
          font-weight: bold;
          border-radius: 8px;
          display: inline-block;
          box-shadow: 0 4px 6px rgba(255, 215, 0, 0.15);
          transition: all 0.2s ease;
        }
        .btn-reset:hover {
          background-color: #ffe23b;
          box-shadow: 0 4px 8px rgba(255, 215, 0, 0.25);
        }
        .footer {
          background-color: #f1f5f9;
          padding: 20px 30px;
          text-align: center;
          font-size: 12px;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
        }
        .link-fallback {
          word-break: break-all;
          font-size: 13px;
          color: #0B2E6B;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Nalanda Digital Library</h1>
        </div>
        <div class="content">
          <p>Hello ${name},</p>
          <p>We received a request to reset your password for your Nalanda Digital Library account. Click the button below to choose a new password. This reset link is valid for <strong>15 minutes</strong>.</p>
          
          <div class="btn-container">
            <a href="${resetUrl}" class="btn-reset" target="_blank">Reset Password</a>
          </div>
          
          <p>If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          <p>If the button above does not work, please copy and paste the link below into your browser:</p>
          <p class="link-fallback"><a href="${resetUrl}">${resetUrl}</a></p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Nalanda Digital Library. All rights reserved.</p>
          <p>Study Cabin Management & Learning Ecosystem</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Nalanda Digital Library" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Nalanda Digital Library - Password Reset Request',
    html: htmlContent
  };

  await transporter.sendMail(mailOptions);
  return { success: true, mock: false };
};

module.exports = {
  sendResetPasswordEmail
};
